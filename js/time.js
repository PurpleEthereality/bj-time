// ======================== 北京时间同步 & 时间显示 ========================

// 依次尝试多个时间源，任一成功即用。
// Netlify 部署时 /.netlify/functions/bj-time 由服务端函数提供（真实校时）；
// GitHub Pages 等纯静态托管下该请求会 404，自动回退到静态替身文件，
// 再由 time.js 的 catch 分支回退到访客本机时间。
function timeSourceCandidates() {
    let list = [];
    if (location.hostname.endsWith('netlify.app') || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        list.push('/.netlify/functions/bj-time');
    }
    list.push('functions/bj-time.json');
    return list;
}

async function fetchBeijingTime() {
    for (let url of timeSourceCandidates()) {
        try {
            let res = await fetch(url, { cache: 'no-store' });
            if(!res.ok) continue;
            let data = await res.json();
            if(data.success && data.originalData && data.originalData.code === 200) {
                let beijing = new Date(data.originalData.time);
                timeOffset = beijing - new Date();
                lastTimeSync = Date.now();
                return;
            }
        } catch(e) { /* 试下一个源 */ }
    }
    console.error('时间同步失败：所有时间源均不可用，已回退本机时间');
    timeOffset = 0;
}

function updateTimeDisplay() {
    let now = new Date(Date.now() + timeOffset);
    elements.hours.textContent = String(now.getHours()).padStart(2,'0');
    elements.minutes.textContent = String(now.getMinutes()).padStart(2,'0');
    if(elements.showSecondsCheckbox.checked) {
        elements.seconds.textContent = String(now.getSeconds()).padStart(2,'0');
        elements.seconds.style.display = 'inline'; 
        elements.colonAfterMinute.style.display = 'inline';
        if(elements.colonAfterHour) elements.colonAfterHour.classList.remove('blink-colon');
    } else { 
        elements.seconds.style.display = 'none'; 
        elements.colonAfterMinute.style.display = 'none'; 
        if(elements.colonAfterHour) elements.colonAfterHour.classList.add('blink-colon'); 
    }
    if(elements.showMillisecondsCheckbox.checked) { 
        elements.milliseconds.textContent = String(now.getMilliseconds()).padStart(3,'0'); 
        document.querySelector('.milliseconds').style.display = 'inline';
    } else document.querySelector('.milliseconds').style.display = 'none';
    if(elements.showDateCheckbox.checked) elements.dateDisplay.textContent = now.toLocaleDateString('zh-CN', {year:'numeric', month:'long', day:'numeric', weekday:'long'});
    else elements.dateDisplay.style.display = 'none';
    
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            updateGaokaoCountdown();
            updateNextExam();
            updateCountdownDisplay();
        });
    } else {
        setTimeout(() => {
            updateGaokaoCountdown();
            updateNextExam();
            updateCountdownDisplay();
        }, 0);
    }
}

function updateTime(timestamp) { 
    updateTimeDisplay(); 
    animationFrameId = requestAnimationFrame(updateTime); 
}

function updateGaokaoCountdown() {
    let now = new Date(Date.now()+timeOffset), year = now.getFullYear();
    let start = new Date(year,5,7), end = new Date(year,5,9,23,59,59,999);
    if(now >= start && now <= end) { 
        elements.gaokaoText.innerHTML = `${year}年高考进行中！<br>加油！`; 
        elements.gaokaoCountdown.style.background = 'rgba(106, 17, 203, 0.2)'; 
        return; 
    }
    let target = start; 
    if(now > end) target = new Date(year+1,5,7);
    let diff = target - now;
    if(diff < 0) { 
        elements.gaokaoText.innerHTML = `${target.getFullYear()}年高考已结束！`; 
        return; 
    }
    let days = Math.floor(diff/86400000), hours = Math.floor((diff%86400000)/3600000), minutes = Math.floor((diff%3600000)/60000);
    elements.gaokaoText.innerHTML = `距离${target.getFullYear()}年高考还有<br>${days}天${hours}小时${minutes}分钟`;
    elements.gaokaoCountdown.style.background = 'rgba(106, 17, 203, 0.1)';
}

function updateNextExam() {
    let now = new Date(Date.now()+timeOffset), year = now.getFullYear();
    let month = now.getMonth()+1, date = now.getDate();
    if(month !== 6 || date<7 || date>9) { 
        elements.nextExamContainer.style.display = 'none'; 
        return; 
    }
    elements.nextExamContainer.style.display = 'inline-block';
    let next = null, minDiff = Infinity;
    for(let sub of examSubjects) {
        if(ignoredSubjects.includes(sub.name)) continue;
        let [m,d] = sub.date.split('-'), [h,mi] = sub.startTime.split(':');
        let examDate = new Date(year, parseInt(m)-1, parseInt(d), parseInt(h), parseInt(mi));
        let diff = examDate - now;
        if(diff > 0 && diff < minDiff) { 
            minDiff = diff; 
            next = sub; 
        }
    }
    if(next) { 
        let hours = Math.floor(minDiff/3600000), minutes = Math.floor((minDiff%3600000)/60000); 
        elements.nextExamText.innerHTML = `下一科是: ${next.name}<br>距离开考仅剩: ${hours}时${minutes}分`; 
    } else elements.nextExamText.innerHTML = "所有科目考试结束";
}
