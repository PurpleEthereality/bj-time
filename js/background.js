// ======================== 背景逻辑 ========================

function applyBackground(url, avoidCache=true, showNotif=false) {
    if(bgLoading) return;
    elements.bgLoader.classList.add('visible'); 
    bgLoading = true;
    let finalUrl = url;
    if(avoidCache && url.startsWith('http')) finalUrl += (url.includes('?')?'&':'?') + `t=${Date.now()}`;
    let img = new Image();
    img.onload = () => {
        inactiveBgLayer.style.backgroundImage = `url('${finalUrl}')`;
        inactiveBgLayer.classList.add('active');
        activeBgLayer.classList.remove('active');
        let tmp = activeBgLayer; 
        activeBgLayer = inactiveBgLayer; 
        inactiveBgLayer = tmp;
        if(bgClearTimeout) clearTimeout(bgClearTimeout);
        bgClearTimeout = setTimeout(() => { inactiveBgLayer.style.backgroundImage = ''; }, 5000);
        setTimeout(() => { elements.bgLoader.classList.remove('visible'); bgLoading = false; }, 300);
        currentBgUrl = finalUrl;
        if(showNotif) showToast('背景图片已成功应用！');
        if(elements.showBgProgressCheckbox.checked && finalUrl && !finalUrl.startsWith('data:') && currentPreset !== 'bing') elements.bgProgress.style.display = 'block';
        else elements.bgProgress.style.display = 'none';
    };
    img.onerror = () => { 
        elements.bgLoader.classList.remove('visible'); 
        bgLoading = false; 
        showToast('背景图片加载失败'); 
    };
    img.src = finalUrl;
}

function applyPresetBackground(preset, avoidCache=false, showNotif=false) {
    currentPreset = preset; 
    customBg = null;
    localStorage.setItem('backgroundPreset', preset); 
    localStorage.removeItem('customBackground');
    if(bgInterval) clearInterval(bgInterval);
    if(preset === 'random') {
        changeRandomBg(true, showNotif);
        bgInterval = setInterval(() => changeRandomBg(true,false), bgIntervalTime*60*1000);
    } else {
        let url = bgPresets[preset];
        applyBackground(url, true, showNotif);
        bgInterval = setInterval(() => applyPresetBackground(preset, false, false), bgIntervalTime*60*1000);
    }
    resetBgTimer();
    updatePresetButtons(preset);
}

function changeRandomBg(avoidCache=true, showNotif=false) {
    let idx = Math.floor(Math.random() * bgPresets.random.length);
    applyBackground(bgPresets.random[idx], avoidCache, showNotif);
    resetBgTimer();
}

function updatePresetButtons(active) {
    elements.presetBtns.forEach(btn => { 
        if(btn.dataset.preset === active) btn.classList.add('active'); 
        else btn.classList.remove('active'); 
    });
}

function applyCustomBackground(url, showNotif=true) {
    customBg = url; 
    currentPreset = null;
    localStorage.setItem('customBackground', url); 
    localStorage.removeItem('backgroundPreset');
    updatePresetButtons(null);
    if(bgInterval) clearInterval(bgInterval);
    applyBackground(url, true, showNotif);
    bgInterval = setInterval(() => applyBackground(url, false, false), bgIntervalTime*60*1000);
    resetBgTimer();
}

function preloadNextBackground() {
    if (isPreloading) return;
    
    isPreloading = true;
    let url = '';
    let avoidCache = false;
    
    if (customBg) {
        url = customBg;
        avoidCache = false;
    } else if (currentPreset) {
        if (currentPreset === 'random') {
            let idx = Math.floor(Math.random() * bgPresets.random.length);
            url = bgPresets.random[idx];
            avoidCache = true;
        } else {
            url = bgPresets[currentPreset];
            avoidCache = true;
        }
    }
    
    if (url) {
        let finalUrl = url;
        if (avoidCache && url.startsWith('http')) {
            finalUrl += (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
        }
        
        const img = new Image();
        img.onload = () => {
            inactiveBgLayer.style.backgroundImage = `url('${finalUrl}')`;
            nextBgUrl = finalUrl;
            isPreloading = false;
        };
        img.onerror = () => {
            nextBgUrl = null;
            isPreloading = false;
        };
        img.src = finalUrl;
    } else {
        isPreloading = false;
    }
}

function showPreloadedBackground() {
    if (nextBgUrl) {
        inactiveBgLayer.classList.add('active');
        activeBgLayer.classList.remove('active');
        
        let tmp = activeBgLayer;
        activeBgLayer = inactiveBgLayer;
        inactiveBgLayer = tmp;
        
        if(bgClearTimeout) clearTimeout(bgClearTimeout);
        bgClearTimeout = setTimeout(() => {
            inactiveBgLayer.style.backgroundImage = '';
        }, 1000);
        
        currentBgUrl = nextBgUrl;
        nextBgUrl = null;
    } else {
        if (customBg) {
            applyBackground(customBg, true, false);
        } else if (currentPreset) {
            if (currentPreset === 'random') {
                changeRandomBg(true, false);
            } else {
                applyPresetBackground(currentPreset, true, false);
            }
        }
    }
}

function resetBgTimer() {
    if(bgAnimationFrame) cancelAnimationFrame(bgAnimationFrame);
    bgStartTime = Date.now(); 
    bgDuration = bgIntervalTime * 60 * 1000;
    nextBgUrl = null;
    isPreloading = false;
    let preloadTriggered = false;
    let cs = getComputedStyle(document.documentElement);
    let colorNormal = (cs.getPropertyValue('--progress-normal')||'#58c9a9').trim();
    let colorWarn = (cs.getPropertyValue('--progress-warning')||'#ff8a7a').trim();
    
    let update = () => {
        let elapsed = Date.now() - bgStartTime, remaining = bgDuration - elapsed;
        let progress = Math.min(100, (remaining/bgDuration)*100);
        elements.bgProgressBar.style.transform = `scaleX(${progress/100})`;
        elements.bgProgressBar.style.backgroundColor = remaining < 15000 ? colorWarn : colorNormal;
        
        if (remaining < 15000 && !isPreloading && !preloadTriggered) {
            preloadNextBackground();
            preloadTriggered = true;
        }
        
        if(elapsed >= bgDuration) {
            if (nextBgUrl) {
                showPreloadedBackground();
            } else {
                if (customBg) {
                    applyBackground(customBg, true, false);
                } else if (currentPreset) {
                    if (currentPreset === 'random') {
                        changeRandomBg(true, false);
                    } else {
                        applyPresetBackground(currentPreset, true, false);
                    }
                }
            }
            resetBgTimer();
        } else {
            bgAnimationFrame = requestAnimationFrame(update);
        }
    };
    bgAnimationFrame = requestAnimationFrame(update);
}
