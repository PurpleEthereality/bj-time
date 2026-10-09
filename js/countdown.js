// ======================== 倒数日逻辑 ========================

function initCountdowns() {
    let saved = localStorage.getItem('countdowns');
    if(saved) try { countdowns = JSON.parse(saved); } catch(e){ countdowns = []; }
    renderCountdownsList();
    updateCountdownDisplay();
}

function renderCountdownsList() {
    elements.countdownsList.innerHTML = '';
    countdowns.forEach(cd => {
        let row = document.createElement('div'); 
        row.className = 'countdown-item-row';
        row.innerHTML = `
            <div class="countdown-item-info"><div class="countdown-item-title">${cd.title}</div><div class="countdown-item-date">${formatDate(new Date(cd.endDate))}</div></div>
            <div class="countdown-item-actions">
                <button class="countdown-toggle-btn ${cd.hidden ? 'hidden' : ''}" data-id="${cd.id}" title="${cd.hidden ? '显示' : '隐藏'}"><i class="fas ${cd.hidden ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
                <button class="countdown-edit-btn" data-id="${cd.id}" title="编辑"><i class="fas fa-edit"></i></button>
                <button class="countdown-delete-btn" data-id="${cd.id}" title="删除"><i class="fas fa-trash"></i></button>
            </div>`;
        elements.countdownsList.appendChild(row);
    });
    document.querySelectorAll('.countdown-edit-btn').forEach(btn => btn.addEventListener('click', () => editCountdown(btn.dataset.id)));
    document.querySelectorAll('.countdown-delete-btn').forEach(btn => btn.addEventListener('click', () => deleteCountdown(btn.dataset.id)));
    document.querySelectorAll('.countdown-toggle-btn').forEach(btn => btn.addEventListener('click', () => toggleCountdownVisibility(btn.dataset.id)));
}

function toggleCountdownVisibility(id) {
    let idx = countdowns.findIndex(c => c.id == id);
    if(idx !== -1) { 
        countdowns[idx].hidden = !countdowns[idx].hidden; 
        localStorage.setItem('countdowns',JSON.stringify(countdowns)); 
        renderCountdownsList(); 
        updateCountdownDisplay(); 
        showToast(`已${countdowns[idx].hidden?'隐藏':'显示'}该倒数日`); 
    }
}

function addCountdown() {
    let title = elements.countdownTitleInput.value.trim(), dateVal = elements.countdownDateInput.value;
    if(!title) return showToast('请输入事件内容');
    if(title.length>10) return showToast('事件内容最多10个字');
    if(!dateVal) return showToast('请选择结束时间');
    let endDate = new Date(dateVal);
    let newCd = { id: Date.now(), title, endDate: endDate.toISOString(), hidden: false };
    if(editingCountdownId) {
        let idx = countdowns.findIndex(c => c.id === editingCountdownId);
        if(idx !== -1) countdowns[idx] = newCd;
        editingCountdownId = null;
        showToast('倒数日已更新');
    } else { 
        countdowns.push(newCd); 
        showToast('倒数日已添加'); 
    }
    localStorage.setItem('countdowns', JSON.stringify(countdowns));
    elements.countdownTitleInput.value = ''; 
    elements.countdownDateInput.value = '';
    renderCountdownsList(); 
    updateCountdownDisplay();
}

function editCountdown(id) {
    let cd = countdowns.find(c => c.id == id);
    if(cd) { 
        elements.countdownTitleInput.value = cd.title; 
        elements.countdownDateInput.value = formatDateTimeLocal(new Date(cd.endDate)); 
        editingCountdownId = cd.id; 
        document.querySelector('.countdowns-form').scrollIntoView({ behavior:'smooth' }); 
    }
}

function deleteCountdown(id) {
    if(confirm('确定要删除这个倒数日吗？')) { 
        countdowns = countdowns.filter(c => c.id != id); 
        localStorage.setItem('countdowns',JSON.stringify(countdowns)); 
        renderCountdownsList(); 
        updateCountdownDisplay(); 
        showToast('倒数日已删除'); 
    }
}

function updateCountdownDisplay() {
    let now = new Date(Date.now() + timeOffset);
    updateTopCountdowns(now);
    updateCountdownPanel(now);
}

function updateTopCountdowns(now) {
    elements.topCountdowns.innerHTML = '';
    if(elements.showGaokaoCheckbox.checked) elements.topCountdowns.appendChild(elements.gaokaoCountdown);
    let visible = countdowns.filter(c => !c.hidden);
    for(let i=0; i<Math.min(2, visible.length); i++) {
        let cd = visible[i];
        let diff = calculateTimeDiff(now, new Date(cd.endDate));
        let span = document.createElement('span'); 
        span.className = 'countdown-item';
        span.innerHTML = `<i class="fas fa-calendar"></i><span>${cd.title}：${formatTimeDiff(diff)}</span>`;
        elements.topCountdowns.appendChild(span);
    }
}

function updateCountdownPanel(now) {
    elements.countdownPanelItems.innerHTML = '';
    if(elements.showGaokaoCheckbox.checked) {
        let gDiff = calculateGaokaoTimeDiff(now);
        if(gDiff) {
            let item = document.createElement('div'); 
            item.className = 'countdown-panel-item';
            item.innerHTML = `<div class="countdown-panel-item-title">高考倒计时</div><div class="countdown-panel-item-time">${formatTimeDiff(gDiff)}</div>`;
            elements.countdownPanelItems.appendChild(item);
        }
    }
    countdowns.forEach(cd => {
        let diff = calculateTimeDiff(now, new Date(cd.endDate));
        let item = document.createElement('div'); 
        item.className = 'countdown-panel-item';
        item.innerHTML = `<div class="countdown-panel-item-title">${cd.title}</div><div class="countdown-panel-item-time">${formatTimeDiff(diff)}</div>`;
        elements.countdownPanelItems.appendChild(item);
    });
    if(elements.countdownPanelItems.children.length === 0) elements.countdownPanelItems.innerHTML = '<div class="countdown-panel-item"><div class="countdown-panel-item-title">暂无倒数日</div></div>';
}

function calculateGaokaoTimeDiff(now) {
    let year = now.getFullYear();
    let start = new Date(year,5,7), end = new Date(year,5,9,23,59,59,999);
    if(now >= start && now <= end) { 
        elements.gaokaoText.innerHTML = `${year}年高考进行中！<br>加油！`; 
        elements.gaokaoCountdown.style.background = 'rgba(106, 17, 203, 0.2)'; 
        return null; 
    }
    let target = start;
    if(now > end) target = new Date(year+1,5,7);
    return calculateTimeDiff(now, target);
}
