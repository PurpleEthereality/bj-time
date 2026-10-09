// ======================== 金句逻辑 ========================

function typewriterEffect(text) {
    isTyping = true;
    let i = 0;
    elements.quoteText.innerHTML = '';
    elements.quoteAuthor.textContent = '';
    elements.quoteType.textContent = '';
    
    const startTime = Date.now();
    const duration = text.length * 50;
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentIndex = Math.floor(progress * text.length);
        
        if (currentIndex < text.length) {
            elements.quoteText.innerHTML = text.substring(0, currentIndex + 1) + '<span class="cursor"></span>';
            requestAnimationFrame(update);
        } else {
            elements.quoteText.innerHTML = text;
            isTyping = false;
        }
    }
    
    requestAnimationFrame(update);
}

function displayQuote(text, author, type) {
    elements.quoteText.innerHTML = '';
    elements.quoteContent.classList.remove('fade-in','slide-up');
    if(quoteAnimationType === 'typewriter') typewriterEffect(text);
    else elements.quoteText.textContent = text;
    setTimeout(() => {
        let authorInfo = author || '未知';
        elements.quoteAuthor.textContent = `—— ${authorInfo}`;
        elements.quoteType.textContent = type;
    }, 300);
}

async function fetchQuote() {
    if(isTyping) return;
    let forceExt = false;
    if(enableQuoteGuarantee && consecutiveNonExtension >= 9 && elements.extensionTypeCheckbox.checked && extensionQuotes.length > 0) { 
        forceExt = true; 
        consecutiveNonExtension = 0; 
    }
    let randomType = quoteTypes[Math.floor(Math.random()*quoteTypes.length)];
    if((forceExt || randomType === 'm') && elements.extensionTypeCheckbox.checked && extensionQuotes.length > 0) {
        let avail = extensionQuotes.filter(q => !isQuoteFiltered(q));
        if(avail.length) {
            let q = avail[Math.floor(Math.random()*avail.length)];
            let authorInfo = q.from_who ? (q.from_who + (q.from ? ` · ${q.from}` : '')) : (q.from ? `出自：${q.from}` : '未知');
            displayQuote(q.hitokoto, authorInfo, getTypeName(q.type));
            elements.apiStatus.className = 'status-indicator'; 
            elements.apiStatusText.textContent = '扩展金句';
            resetQuoteTimer(); 
            return;
        }
    }
    try {
        let urls = ['https://v1.hitokoto.cn','https://international.v1.hitokoto.cn'];
        let data = null;
        for(let url of urls) {
            try { 
                let res = await fetch(`${url}?c=${randomType}&encode=json`); 
                if(res.ok) { 
                    data = await res.json(); 
                    break; 
                } 
            } catch(e) {}
        }
        if(!data) throw new Error();
        let authorInfo = data.from_who ? (data.from_who + (data.from ? ` · ${data.from}` : '')) : (data.from ? `出自：${data.from}` : '未知');
        displayQuote(data.hitokoto, authorInfo, getTypeName(data.type));
        elements.apiStatus.className = 'status-indicator'; 
        elements.apiStatusText.textContent = 'API正常';
        if(enableQuoteGuarantee && data.type !== 'm') consecutiveNonExtension++;
    } catch(e) {
        let local = localQuotes[Math.floor(Math.random()*localQuotes.length)];
        displayQuote(local.quote, local.author, local.type);
        elements.apiStatus.className = 'status-indicator offline'; 
        elements.apiStatusText.textContent = '使用本地金句';
        if(enableQuoteGuarantee) consecutiveNonExtension++;
        showToast('金句API不可用，已使用本地金句');
    }
    resetQuoteTimer();
}

function resetQuoteTimer() {
    if(quoteAnimationFrame) cancelAnimationFrame(quoteAnimationFrame);
    quoteStartTime = Date.now(); 
    quoteDuration = quoteInterval * 60 * 1000;
    let cs = getComputedStyle(document.documentElement);
    let colorNormal = (cs.getPropertyValue('--progress-normal')||'#58c9a9').trim();
    let colorWarn = (cs.getPropertyValue('--progress-warning')||'#ff8a7a').trim();
    let update = () => {
        let elapsed = Date.now() - quoteStartTime, remaining = quoteDuration - elapsed;
        let progress = Math.min(100, (remaining/quoteDuration)*100);
        elements.quoteProgressBar.style.transform = `scaleX(${progress/100})`;
        elements.quoteProgressBar.style.backgroundColor = remaining < 15000 ? colorWarn : colorNormal;
        if(elapsed >= quoteDuration) fetchQuote();
        else quoteAnimationFrame = requestAnimationFrame(update);
    };
    quoteAnimationFrame = requestAnimationFrame(update);
}

async function downloadExtensionQuotes(silent=false) {
    try {
        elements.extStatus.className = 'status-indicator pulse'; 
        elements.extStatusText.textContent = '下载中...';
        // Netlify 上用服务端函数，纯静态托管回退到 functions/jinju.json
        let urls = [];
        if (location.hostname.endsWith('netlify.app') || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            urls.push('/.netlify/functions/jinju');
        }
        urls.push('functions/jinju.json');
        let res = null;
        for (let u of urls) {
            try {
                let r = await fetch(u, { cache: 'no-store' });
                if (r.ok) { res = r; break; }
            } catch(e) { /* 试下一个源 */ }
        }
        if(!res) throw new Error();
        let data = await res.json();
        if(data.success && data.contents) {
            let json = JSON.parse(data.contents);
            if(Array.isArray(json) && json.length) {
                extensionQuotes = json; 
                localStorage.setItem('extensionQuotes', JSON.stringify(json));
                localStorage.setItem('extensionQuotesLastUpdate', Date.now());
                if(!silent) showToast('扩展金句已更新');
                updateExtensionStatus(); 
                downloadRetryCount = 0; 
                extractTags();
            } else throw new Error();
        } else throw new Error();
    } catch(e) {
        if(downloadRetryCount < maxRetries) { 
            downloadRetryCount++; 
            setTimeout(()=>downloadExtensionQuotes(silent), Math.min(3000, downloadRetryCount*500)); 
            if(!silent) showToast(`下载失败，正在重试 (${downloadRetryCount}/${maxRetries})`); 
        } else { 
            extensionQuotes = sampleExtensionQuotes; 
            localStorage.setItem('extensionQuotes', JSON.stringify(sampleExtensionQuotes)); 
            if(!silent) showToast('使用本地扩展金句'); 
            updateExtensionStatus(); 
            downloadRetryCount=0; 
            extractTags(); 
        }
    }
}

function initExtensionQuotes() {
    let saved = localStorage.getItem('extensionQuotes'), savedTags = localStorage.getItem('filteredTags');
    if(saved) try { extensionQuotes = JSON.parse(saved); } catch(e){ extensionQuotes = sampleExtensionQuotes; localStorage.setItem('extensionQuotes',JSON.stringify(sampleExtensionQuotes)); }
    else extensionQuotes = sampleExtensionQuotes;
    if(savedTags) try { filteredTags = JSON.parse(savedTags); } catch(e){ filteredTags = []; }
    updateExtensionStatus(); 
    extractTags();
    let last = localStorage.getItem('extensionQuotesLastUpdate');
    if(elements.extensionTypeCheckbox.checked && (!last || Date.now()-last > 86400000)) downloadExtensionQuotes(true);
}
