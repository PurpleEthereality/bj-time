// ======================== 工具函数 ========================

function showToast(msg) {
    elements.toastMessage.textContent = msg;
    elements.toast.classList.add('show');
    setTimeout(() => elements.toast.classList.remove('show'), 3000);
}

function formatDate(date) { 
    return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`; 
}

function formatDateTimeLocal(date) {
    let y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,'0'), d = String(date.getDate()).padStart(2,'0');
    let h = String(date.getHours()).padStart(2,'0'), mi = String(date.getMinutes()).padStart(2,'0');
    return `${y}-${m}-${d}T${h}:${mi}`;
}

function calculateTimeDiff(now, target) {
    if(target < now) return { days:0, hours:0, minutes:0 };
    let diff = target - now;
    return { 
        days: Math.floor(diff/(86400000)), 
        hours: Math.floor((diff%86400000)/(3600000)), 
        minutes: Math.floor((diff%3600000)/60000) 
    };
}

function formatTimeDiff(td) {
    if(td.days > 0) return `${td.days}天${td.hours}小时`;
    if(td.hours > 0) return `${td.hours}小时${td.minutes}分钟`;
    return `${td.minutes}分钟`;
}

function getTypeName(type) {
    const map = { a:'动画',b:'漫画',c:'游戏',d:'文学',e:'原创',f:'网络',g:'其他',h:'影视',i:'诗词',j:'网易云',k:'哲学',l:'抖机灵',m:'拓展' };
    return map[type] || type;
}

function updateExtensionStatus() {
    let saved = localStorage.getItem('extensionQuotes');
    if(saved) {
        try { 
            let q = JSON.parse(saved); 
            elements.extStatus.className = 'status-indicator'; 
            elements.extStatusText.textContent = `拓展金句: 已启用 (${q.length}条)`;
        } catch(e){ 
            elements.extStatus.className = 'status-indicator offline'; 
            elements.extStatusText.textContent = '拓展金句: 数据损坏'; 
        }
    } else { 
        elements.extStatus.className = 'status-indicator offline'; 
        elements.extStatusText.textContent = '拓展金句: 已禁用'; 
    }
}

function extractTags() {
    let set = new Set();
    extensionQuotes.forEach(q => { 
        if(q.tag && Array.isArray(q.tag)) q.tag.forEach(t => set.add(t)); 
    });
    allTags = Array.from(set);
    renderTagFilters();
}

function renderTagFilters() {
    elements.tagFilterGroup.innerHTML = '';
    allTags.forEach(tag => {
        let el = document.createElement('div');
        el.className = `tag-filter-item ${filteredTags.includes(tag) ? 'active' : ''}`;
        el.innerHTML = `<span>${tag}</span>`;
        el.addEventListener('click', () => toggleTagFilter(tag));
        elements.tagFilterGroup.appendChild(el);
    });
}

function toggleTagFilter(tag) {
    if(filteredTags.includes(tag)) filteredTags = filteredTags.filter(t => t !== tag);
    else filteredTags.push(tag);
    localStorage.setItem('filteredTags', JSON.stringify(filteredTags));
    renderTagFilters();
    showToast(`标签过滤已更新`);
}

function isQuoteFiltered(quote) { 
    return quote.tag && quote.tag.some(t => filteredTags.includes(t)); 
}

function getCollapsedGroups() { 
    let arr=[]; 
    document.querySelectorAll('.setting-group').forEach(g=>{ 
        if(g.classList.contains('collapsed')) arr.push(g.id); 
    }); 
    return arr; 
}

function updateHolidayImageVisibility() {
    if(elements.showHolidayImageCheckbox.checked) elements.countdownPanel.classList.remove('hide-holiday-image');
    else elements.countdownPanel.classList.add('hide-holiday-image');
}
