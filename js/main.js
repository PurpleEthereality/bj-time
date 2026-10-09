// ======================== 初始化 & 事件绑定 ========================

function init() {
    fetchBeijingTime(); 
    setInterval(fetchBeijingTime, 5*60*1000);
    loadSettings(); 
    animationFrameId = requestAnimationFrame(updateTime);
    fetchQuote(); 
    initExtensionQuotes(); 
    initCountdowns();
    
    document.querySelectorAll('.setting-group').forEach(group => {
        let header = group.querySelector('.setting-group-header');
        header.addEventListener('click', () => {
            group.classList.toggle('collapsed');
            saveSettings();
        });
    });
    
    elements.extensionTypeCheckbox.addEventListener('change', () => {
        if(elements.extensionTypeCheckbox.checked) { 
            if(!localStorage.getItem('extensionQuotes')) downloadExtensionQuotes(); 
            else updateExtensionStatus(); 
        } else { 
            localStorage.removeItem('extensionQuotes'); 
            updateExtensionStatus(); 
        }
        saveSettings();
    });
    elements.quotePriorityRadio.addEventListener('change', () => { 
        if(elements.quotePriorityRadio.checked) { 
            document.body.classList.remove('time-priority'); 
            document.body.classList.add('quote-priority'); 
        } 
        saveSettings(); 
    });
    elements.timePriorityRadio.addEventListener('change', () => { 
        if(elements.timePriorityRadio.checked) { 
            document.body.classList.remove('quote-priority'); 
            document.body.classList.add('time-priority'); 
        } 
        saveSettings(); 
    });
    document.querySelectorAll('input[name="ignoredSubject"]').forEach(cb => {
        cb.addEventListener('change', () => { 
            let sub = cb.value; 
            if(cb.checked) ignoredSubjects = ignoredSubjects.filter(s=>s!==sub); 
            else if(!ignoredSubjects.includes(sub)) ignoredSubjects.push(sub); 
            saveSettings(); 
            updateNextExam(); 
        });
    });
    elements.showGaokaoCheckbox.addEventListener('change', () => { 
        saveSettings(); 
        updateCountdownDisplay(); 
    });
    elements.showHolidayImageCheckbox.addEventListener('change', () => { 
        updateHolidayImageVisibility(); 
        saveSettings(); 
    });
    elements.toggleGuaranteeBtn.addEventListener('click', () => { 
        enableQuoteGuarantee = !enableQuoteGuarantee; 
        elements.toggleGuaranteeBtn.innerHTML = enableQuoteGuarantee ? '<i class="fas fa-shield-alt"></i> 保底机制: 开' : '<i class="fas fa-shield-alt"></i> 保底机制: 关'; 
        showToast(`金句保底机制已${enableQuoteGuarantee?'开启':'关闭'}`); 
        saveSettings(); 
    });
    elements.aboutBtn.addEventListener('click', () => window.open('https://zise.asia/archives/time', '_blank'));
    elements.drawerToggle.addEventListener('click', openDrawer);
    elements.drawerOverlay.addEventListener('click', closeDrawer);
    elements.drawerClose.addEventListener('click', closeDrawer);
    elements.drawerQuote.addEventListener('click', () => { fetchQuote(); closeDrawer(); });
    elements.drawerBg.addEventListener('click', () => { changeRandomBg(true, false); closeDrawer(); });
    elements.drawerTheme.addEventListener('click', () => { toggleTheme(); closeDrawer(); });
    elements.drawerOutfit.addEventListener('click', () => { toggleOutfit(); closeDrawer(); });
    elements.themeBtn.addEventListener('click', toggleTheme);
    elements.settingsBtn.addEventListener('click', toggleSettings);
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
    elements.selectAllBtn.addEventListener('click', selectAllTypes);
    elements.deselectAllBtn.addEventListener('click', deselectAllTypes);
    elements.resetBtn.addEventListener('click', resetToDefault);
    elements.downloadExtBtn.addEventListener('click', () => downloadExtensionQuotes());
    elements.addCountdownBtn.addEventListener('click', addCountdown);
    elements.cancelSettingsBtn.addEventListener('click', () => { 
        if(tempSettings) applyFormSettings(tempSettings); 
        toggleSettings(); 
        showToast('设置已恢复'); 
    });
    elements.saveSettingsBtn.addEventListener('click', () => {
        quoteInterval = Math.max(0.5, parseFloat(elements.quoteIntervalInput.value) || 1);
        bgIntervalTime = Math.max(0.5, parseFloat(elements.bgIntervalInput.value) || 30);
        let selected = Array.from(document.querySelectorAll('input[name="quoteType"]:checked')).map(cb=>cb.value);
        if(selected.length) quoteTypes = selected;
        else { 
            quoteTypes = ['k']; 
            elements.container.classList.add('quote-hidden'); 
        }
        quoteAnimationType = document.querySelector('input[name="quoteAnimation"]:checked').value;
        if(!elements.extensionTypeCheckbox.checked) localStorage.removeItem('extensionQuotes');
        resetQuoteTimer(); 
        resetBgTimer();
        document.querySelector('.quote-progress-container').style.display = elements.showQuoteProgressCheckbox.checked ? 'block' : 'none';
        elements.bgProgress.style.display = elements.showBgProgressCheckbox.checked ? 'block' : 'none';
        saveSettings(); 
        toggleSettings(); 
        showToast('设置已保存');
    });
    
    // 样式设置事件监听器
    if (elements.opacitySlider) {
        elements.opacitySlider.addEventListener('input', function() {
            opacity = parseInt(this.value);
            applyStyleSettings();
        });
    }
    if (elements.blurSlider) {
        elements.blurSlider.addEventListener('input', function() {
            blur = parseInt(this.value);
            applyStyleSettings();
        });
    }
    if (elements.resetStyleBtn) {
        elements.resetStyleBtn.addEventListener('click', resetStyleSettings);
    }
    
    // 主题设置事件监听器
    if (elements.themeCards) {
        elements.themeCards.forEach(card => {
            card.addEventListener('click', function() {
                const theme = this.dataset.theme;
                applyTheme(theme);
                if (elements.followSystemTheme) {
                    elements.followSystemTheme.checked = false;
                    followSystemTheme = false;
                }
            });
        });
    }
    
    // 套装设置事件监听器
    if (elements.outfitCards) {
        elements.outfitCards.forEach(card => {
            card.addEventListener('click', function() {
                const oid = this.dataset.outfit;
                applyOutfit(oid);
                if (elements.followSystemTheme) {
                    elements.followSystemTheme.checked = false;
                    followSystemTheme = false;
                }
                saveSettings();
                showToast('已切换套装');
            });
        });
    }
    
    // 跟随系统主题事件监听器
    if (elements.followSystemTheme) {
        elements.followSystemTheme.addEventListener('change', function() {
            followSystemTheme = this.checked;
            if (followSystemTheme) {
                const systemTheme = checkSystemTheme();
                applyTheme(systemTheme);
            }
        });
    }
    
    // 系统主题变化监听器
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange);
    }
    
    elements.presetBtns.forEach(btn => {
        btn.addEventListener('click', () => { 
            let p = btn.dataset.preset; 
            currentPreset = p; 
            customBg = null; 
            updatePresetButtons(p); 
            applyPresetBackground(p, true, true); 
        });
    });
    elements.refreshQuoteBtn.addEventListener('click', () => { 
        fetchQuote(); 
        showToast('金句已成功更换！'); 
    });
    elements.refreshBgBtn.addEventListener('click', () => { 
        if(currentPreset === 'random') changeRandomBg(true,true); 
        else if(currentPreset) applyPresetBackground(currentPreset, true, true); 
        else if(customBg) applyBackground(customBg, true, true); 
    });
    elements.saveBgBtn.addEventListener('click', () => { 
        let url = elements.bgUrlInput.value.trim(); 
        if(url) applyCustomBackground(url, true); 
    });
    elements.bgLocalBtn.addEventListener('click', () => {
        let inp = document.createElement('input'); 
        inp.type = 'file'; 
        inp.accept = 'image/*';
        inp.onchange = (e) => { 
            let file = e.target.files[0]; 
            if(file) { 
                let reader = new FileReader(); 
                reader.onload = (ev) => { 
                    let dataUrl = ev.target.result; 
                    elements.bgUrlInput.value = dataUrl; 
                    applyCustomBackground(dataUrl, true); 
                }; 
                reader.readAsDataURL(file); 
            } 
        };
        inp.click();
    });
    elements.showQuoteProgressCheckbox.addEventListener('change', () => { 
        document.querySelector('.quote-progress-container').style.display = elements.showQuoteProgressCheckbox.checked ? 'block' : 'none'; 
        saveSettings(); 
    });
    elements.showBgProgressCheckbox.addEventListener('change', () => { 
        elements.bgProgress.style.display = elements.showBgProgressCheckbox.checked ? 'block' : 'none'; 
        saveSettings(); 
    });
    
    // 导入导出事件绑定
    elements.exportSettingsBtn.addEventListener('click', exportSettings);
    elements.importSettingsBtn.addEventListener('click', () => elements.importFileInput.click());
    elements.importFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importSettings(e.target.files[0]);
            e.target.value = '';
        }
    });
}

window.addEventListener('DOMContentLoaded', init);
