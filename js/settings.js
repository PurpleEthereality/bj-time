// ======================== 设置面板和存储 ========================

function toggleSettings() {
    elements.container.classList.toggle('settings-open');
    if(elements.container.classList.contains('settings-open')) {
        document.querySelector('header').style.display = 'none';
        document.querySelector('.main-content').style.display = 'none';
        elements.countdownSidebar.style.display = 'none';
        tempSettings = getCurrentFormSettings();
        elements.drawerToggle.classList.add('hidden');
        closeDrawer();
    } else {
        document.querySelector('header').style.display = 'flex';
        document.querySelector('.main-content').style.display = 'flex';
        elements.countdownSidebar.style.display = 'flex';
        elements.drawerToggle.classList.remove('hidden');
    }
}

function getCurrentFormSettings() {
    return {
        showDate: elements.showDateCheckbox.checked, showSeconds: elements.showSecondsCheckbox.checked,
        showMilliseconds: elements.showMillisecondsCheckbox.checked, showQuoteProgress: elements.showQuoteProgressCheckbox.checked,
        showBgProgress: elements.showBgProgressCheckbox.checked, showGaokao: elements.showGaokaoCheckbox.checked,
        showHolidayImage: elements.showHolidayImageCheckbox.checked,
        quoteTypes: Array.from(document.querySelectorAll('input[name="quoteType"]:checked')).map(cb=>cb.value),
        quoteInterval: parseFloat(elements.quoteIntervalInput.value)||1, bgInterval: parseFloat(elements.bgIntervalInput.value)||30,
        bgUrl: elements.bgUrlInput.value, currentPreset: currentPreset,
        displayPriority: document.querySelector('input[name="displayPriority"]:checked').value,
        enableQuoteGuarantee: enableQuoteGuarantee, ignoredSubjects: ignoredSubjects,
        quoteAnimationType: document.querySelector('input[name="quoteAnimation"]:checked').value,
        collapsedGroups: getCollapsedGroups(), filteredTags: filteredTags
    };
}

function applyFormSettings(settings) {
    elements.showDateCheckbox.checked = settings.showDate;
    elements.showSecondsCheckbox.checked = settings.showSeconds;
    elements.showMillisecondsCheckbox.checked = settings.showMilliseconds;
    elements.showGaokaoCheckbox.checked = settings.showGaokao !== undefined ? settings.showGaokao : true;
    elements.showQuoteProgressCheckbox.checked = settings.showQuoteProgress;
    elements.showBgProgressCheckbox.checked = settings.showBgProgress;
    elements.showHolidayImageCheckbox.checked = settings.showHolidayImage !== undefined ? settings.showHolidayImage : true;
    document.querySelectorAll('input[name="quoteType"]').forEach(cb => { cb.checked = settings.quoteTypes.includes(cb.value); });
    elements.quoteIntervalInput.value = settings.quoteInterval;
    elements.bgIntervalInput.value = settings.bgInterval;
    elements.bgUrlInput.value = settings.bgUrl;
    currentPreset = settings.currentPreset; 
    updatePresetButtons(currentPreset);
    enableQuoteGuarantee = settings.enableQuoteGuarantee !== undefined ? settings.enableQuoteGuarantee : true;
    ignoredSubjects = settings.ignoredSubjects || [];
    quoteAnimationType = settings.quoteAnimationType || 'typewriter';
    filteredTags = settings.filteredTags || [];
    document.querySelectorAll('input[name="quoteAnimation"]').forEach(r => { r.checked = (r.value === quoteAnimationType); });
    document.body.classList.remove('quote-priority','time-priority');
    if(settings.displayPriority === 'time') { 
        document.body.classList.add('time-priority'); 
        elements.timePriorityRadio.checked = true; 
    } else { 
        document.body.classList.add('quote-priority'); 
        elements.quotePriorityRadio.checked = true; 
    }
    document.querySelectorAll('input[name="ignoredSubject"]').forEach(cb => { cb.checked = !ignoredSubjects.includes(cb.value); });
    updateHolidayImageVisibility();
    if(settings.collapsedGroups) settings.collapsedGroups.forEach(gid => { let g = document.getElementById(gid); if(g) g.classList.add('collapsed'); });
}

function selectAllTypes() { 
    document.querySelectorAll('input[name="quoteType"]').forEach(cb=>cb.checked=true); 
}

function deselectAllTypes() { 
    document.querySelectorAll('input[name="quoteType"]').forEach(cb=>cb.checked=false); 
}

function saveSettings() {
    let settings = {
        showDate: elements.showDateCheckbox.checked, showSeconds: elements.showSecondsCheckbox.checked,
        showMilliseconds: elements.showMillisecondsCheckbox.checked, showQuoteProgress: elements.showQuoteProgressCheckbox.checked,
        showBgProgress: elements.showBgProgressCheckbox.checked, showGaokao: elements.showGaokaoCheckbox.checked,
        showHolidayImage: elements.showHolidayImageCheckbox.checked,
        quoteTypes: Array.from(document.querySelectorAll('input[name="quoteType"]:checked')).map(cb=>cb.value),
        theme: currentTheme, themeIndex: currentThemeIndex,
        outfit: currentOutfit,
        followSystemTheme: elements.followSystemTheme ? elements.followSystemTheme.checked : false,
        quoteInterval: quoteInterval, bgInterval: bgIntervalTime,
        displayPriority: document.querySelector('input[name="displayPriority"]:checked').value,
        enableQuoteGuarantee: enableQuoteGuarantee, ignoredSubjects: ignoredSubjects,
        quoteAnimationType: document.querySelector('input[name="quoteAnimation"]:checked').value,
        filteredTags: filteredTags, collapsedGroups: getCollapsedGroups(),
        opacity: opacity, blur: blur
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
}

function loadSettings() {
    let saved = localStorage.getItem('appSettings');
    if(saved) {
        let s = JSON.parse(saved);
        elements.showDateCheckbox.checked = s.showDate;
        elements.showSecondsCheckbox.checked = s.showSeconds;
        elements.showMillisecondsCheckbox.checked = s.showMilliseconds;
        elements.showGaokaoCheckbox.checked = s.showGaokao !== undefined ? s.showGaokao : true;
        elements.showQuoteProgressCheckbox.checked = s.showQuoteProgress || true;
        elements.showBgProgressCheckbox.checked = s.showBgProgress || true;
        elements.showHolidayImageCheckbox.checked = s.showHolidayImage !== undefined ? s.showHolidayImage : true;
        document.querySelector('.quote-progress-container').style.display = elements.showQuoteProgressCheckbox.checked ? 'block' : 'none';
        elements.bgProgress.style.display = elements.showBgProgressCheckbox.checked ? 'block' : 'none';
        document.querySelectorAll('input[name="quoteType"]').forEach(cb => { cb.checked = s.quoteTypes.includes(cb.value); });
        quoteTypes = s.quoteTypes.length ? s.quoteTypes : ['k'];
        if(s.quoteTypes.length===0) elements.container.classList.add('quote-hidden');
        else elements.container.classList.remove('quote-hidden');
        currentTheme = s.theme || 'light'; 
        currentThemeIndex = s.themeIndex || 0;
        followSystemTheme = s.followSystemTheme !== undefined ? s.followSystemTheme : false;
        if (elements.followSystemTheme) {
            elements.followSystemTheme.checked = followSystemTheme;
        }
        
        // 恢复套装（内部会应用正确主题）
        let savedOutfit = s.outfit || localStorage.getItem('outfit') || 'shouzhang';
        applyOutfit(savedOutfit);
        
        if (followSystemTheme) {
            const systemTheme = checkSystemTheme();
            applyTheme(systemTheme);
        }
        quoteAnimationType = s.quoteAnimationType || 'typewriter';
        document.querySelectorAll('input[name="quoteAnimation"]').forEach(r => { r.checked = (r.value === quoteAnimationType); });
        document.body.classList.remove('quote-priority','time-priority');
        if(s.displayPriority === 'time') { 
            document.body.classList.add('time-priority'); 
            elements.timePriorityRadio.checked = true; 
        } else { 
            document.body.classList.add('quote-priority'); 
            elements.quotePriorityRadio.checked = true; 
        }
        if(s.quoteInterval) { 
            quoteInterval = s.quoteInterval; 
            elements.quoteIntervalInput.value = quoteInterval; 
        }
        if(s.bgInterval) { 
            bgIntervalTime = s.bgInterval; 
            elements.bgIntervalInput.value = bgIntervalTime; 
        }
        enableQuoteGuarantee = s.enableQuoteGuarantee !== undefined ? s.enableQuoteGuarantee : true;
        ignoredSubjects = s.ignoredSubjects || [];
        filteredTags = s.filteredTags || [];
        opacity = s.opacity !== undefined ? s.opacity : 70;
        blur = s.blur !== undefined ? s.blur : 5;
        if (elements.opacitySlider) elements.opacitySlider.value = opacity;
        if (elements.blurSlider) elements.blurSlider.value = blur;
        document.querySelectorAll('input[name="ignoredSubject"]').forEach(cb => { cb.checked = !ignoredSubjects.includes(cb.value); });
        updateHolidayImageVisibility();
        if(s.collapsedGroups) s.collapsedGroups.forEach(gid => { let g = document.getElementById(gid); if(g) g.classList.add('collapsed'); });
    } else {
        elements.showDateCheckbox.checked = true; 
        elements.showSecondsCheckbox.checked = true;
        elements.showMillisecondsCheckbox.checked = false; 
        elements.showGaokaoCheckbox.checked = true;
        elements.showQuoteProgressCheckbox.checked = true; 
        elements.showBgProgressCheckbox.checked = true;
        elements.showHolidayImageCheckbox.checked = true;
        if (elements.followSystemTheme) {
            elements.followSystemTheme.checked = false;
        }
        selectAllTypes(); 
        quoteTypes = Array.from(document.querySelectorAll('input[name="quoteType"]')).map(cb=>cb.value);
        elements.quoteIntervalInput.value = 1; 
        elements.bgIntervalInput.value = 30;
        elements.quotePriorityRadio.checked = true; 
        document.body.classList.add('quote-priority');
        enableQuoteGuarantee = true; 
        ignoredSubjects = []; 
        elements.typewriterAnimationRadio.checked = true;
        opacity = 70;
        blur = 5;
        if (elements.opacitySlider) elements.opacitySlider.value = opacity;
        if (elements.blurSlider) elements.blurSlider.value = blur;
        applyOutfit('shouzhang');
        saveSettings();
    }
    document.querySelector('.quote-progress-container').style.display = elements.showQuoteProgressCheckbox.checked ? 'block' : 'none';
    elements.bgProgress.style.display = elements.showBgProgressCheckbox.checked ? 'block' : 'none';
    let savedPreset = localStorage.getItem('backgroundPreset'), savedCustom = localStorage.getItem('customBackground');
    if(savedCustom) { 
        applyCustomBackground(savedCustom, false); 
        elements.bgUrlInput.value = savedCustom; 
    } else if(savedPreset) { 
        applyPresetBackground(savedPreset, false, false); 
        elements.bgUrlInput.value = ''; 
    } else { 
        applyPresetBackground('weimei', false, false); 
    }
    applyStyleSettings();
    updateCountdownDisplay();
}

function resetToDefault() {
    if(confirm('确定要重置所有设置吗？此操作不可撤销！')) {
        localStorage.removeItem('appSettings'); 
        localStorage.removeItem('backgroundPreset'); 
        localStorage.removeItem('customBackground');
        localStorage.removeItem('extensionQuotes'); 
        localStorage.removeItem('countdowns'); 
        localStorage.removeItem('filteredTags');
        opacity = 70;
        blur = 5;
        if (elements.opacitySlider) elements.opacitySlider.value = opacity;
        if (elements.blurSlider) elements.blurSlider.value = blur;
        loadSettings(); 
        initCountdowns(); 
        fetchQuote(); 
        showToast('设置已重置为默认值！');
    }
}

function exportSettings() {
    const exportData = {
        version: '1.0',
        exportTime: new Date().toISOString(),
        settings: null,
        countdowns: null,
        extensionQuotes: null,
        filteredTags: null
    };
    
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        try { exportData.settings = JSON.parse(savedSettings); } catch(e) {}
    }
    
    const savedCountdowns = localStorage.getItem('countdowns');
    if (savedCountdowns) {
        try { exportData.countdowns = JSON.parse(savedCountdowns); } catch(e) {}
    }
    
    const savedExtensionQuotes = localStorage.getItem('extensionQuotes');
    if (savedExtensionQuotes) {
        try { exportData.extensionQuotes = JSON.parse(savedExtensionQuotes); } catch(e) {}
    }
    
    const savedFilteredTags = localStorage.getItem('filteredTags');
    if (savedFilteredTags) {
        try { exportData.filteredTags = JSON.parse(savedFilteredTags); } catch(e) {}
    }
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `青春时光设置备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('设置已导出！');
}

function importSettings(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (!importData.version) {
                showToast('无效的备份文件！');
                return;
            }
            
            if (!confirm('导入设置将覆盖当前所有设置，是否继续？')) {
                return;
            }
            
            if (importData.settings) {
                localStorage.setItem('appSettings', JSON.stringify(importData.settings));
            }
            
            if (importData.countdowns) {
                localStorage.setItem('countdowns', JSON.stringify(importData.countdowns));
                countdowns = importData.countdowns;
            }
            
            if (importData.extensionQuotes) {
                localStorage.setItem('extensionQuotes', JSON.stringify(importData.extensionQuotes));
                extensionQuotes = importData.extensionQuotes;
                extractTags();
            }
            
            if (importData.filteredTags) {
                localStorage.setItem('filteredTags', JSON.stringify(importData.filteredTags));
                filteredTags = importData.filteredTags;
                renderTagFilters();
            }
            
            loadSettings();
            initCountdowns();
            renderCountdownsList();
            updateCountdownDisplay();
            updateExtensionStatus();
            
            showToast('设置导入成功！');
        } catch (err) {
            console.error('导入失败:', err);
            showToast('导入失败：文件格式错误！');
        }
    };
    reader.onerror = function() {
        showToast('读取文件失败！');
    };
    reader.readAsText(file);
}
