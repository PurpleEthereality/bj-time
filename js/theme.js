// ======================== 套装、主题、全屏等UI ========================

// 切换套装：应用套装类 + 默认主题
function applyOutfit(outfitId) {
    if(!outfitId || !outfits.some(o=>o.id===outfitId)) outfitId = 'shouzhang';
    currentOutfit = outfitId;
    
    // 移除所有套装类
    document.body.classList.remove(...outfits.map(o=>'outfit-'+o.id));
    document.body.classList.add('outfit-'+outfitId);
    
    // 当前套装的主题列表
    const outfit = outfits.find(o=>o.id===outfitId);
    // 若当前主题不在该套装支持列表，切到套装默认主题
    if(outfit && !outfit.themes.includes(currentTheme)) {
        applyTheme(outfit.defaultTheme);
    } else {
        applyTheme(currentTheme);
    }
    
    localStorage.setItem('outfit', currentOutfit);
    updateOutfitCards();
}

// 循环切换套装（下一个）
function toggleOutfit() {
    const idx = outfits.findIndex(o=>o.id===currentOutfit);
    const next = outfits[(idx+1)%outfits.length];
    applyOutfit(next.id);
}

function toggleTheme() {
    const outfit = outfits.find(o=>o.id===currentOutfit) || outfits[0];
    currentThemeIndex = outfit.themes.indexOf(currentTheme);
    currentThemeIndex = (currentThemeIndex+1)%outfit.themes.length;
    applyTheme(outfit.themes[currentThemeIndex]);
}

function applyTheme(theme) {
    document.body.classList.remove('dark-theme','ocean-theme','forest-theme','sunset-theme','midnight-theme','sakura-theme','high-contrast-theme','minimal-theme','nature-theme','dawn-theme','paper-theme','studynight-theme','nebula-theme');
    
    if(theme !== 'light') document.body.classList.add(`${theme}-theme`);
    
    currentTheme = theme;
    currentThemeIndex = themes.indexOf(theme);
    
    localStorage.setItem('theme', currentTheme);
    localStorage.setItem('themeIndex', currentThemeIndex);
    
    updateThemeInfo();
    updateThemeCards();
    applyStyleSettings();
}

function updateThemeInfo() {
    if (elements.currentThemeName && elements.currentThemeDesc) {
        elements.currentThemeName.textContent = getThemeDisplayName(currentTheme);
        elements.currentThemeDesc.textContent = themeDescriptions[currentTheme] || '无描述';
    }
    if (elements.currentOutfitName && elements.currentOutfitDesc) {
        const outfit = outfits.find(o=>o.id===currentOutfit) || outfits[0];
        elements.currentOutfitName.textContent = outfit.name;
        elements.currentOutfitDesc.textContent = outfit.desc || '';
    }
}

function getThemeDisplayName(theme) {
    const displayNames = {
        'light': '浅色',
        'dark': '深色',
        'ocean': '海洋',
        'forest': '森林',
        'sunset': '日落',
        'midnight': '午夜',
        'sakura': '樱花',
        'high-contrast': '高对比度',
        'minimal': '极简',
        'nature': '自然',
        'dawn': '奶油',
        'paper': '糖果纸',
        'studynight': '星夜自习',
        'nebula': '云霓'
    };
    return displayNames[theme] || theme;
}

function updateThemeCards() {
    if (elements.themeCards) {
        const outfit = outfits.find(o=>o.id===currentOutfit) || outfits[0];
        elements.themeCards.forEach(card => {
            const theme = card.dataset.theme;
            // 只显示当前套装支持的主题
            card.style.display = outfit.themes.includes(theme) ? '' : 'none';
            if (theme === currentTheme) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }
}

function updateOutfitCards() {
    if (elements.outfitCards) {
        elements.outfitCards.forEach(card => {
            const oid = card.dataset.outfit;
            if (oid === currentOutfit) card.classList.add('active');
            else card.classList.remove('active');
        });
    }
}

function checkSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    } else {
        return 'light';
    }
}

function handleSystemThemeChange(e) {
    if (followSystemTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        applyTheme(systemTheme);
    }
}

function toggleFullscreen() {
    if(!document.fullscreenElement) { 
        document.documentElement.requestFullscreen(); 
        elements.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i><span class="tooltip">退出全屏</span>'; 
    } else { 
        document.exitFullscreen(); 
        elements.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i><span class="tooltip">全屏显示</span>'; 
    }
}

function applyStyleSettings() {
    const opacityValue = opacity / 100;
    const blurValue = blur / 10;
    
    // 读取当前主题的卡片底色（--card-bg），并保持其对比度；透明度滑块只调节背景图透过量
    let baseCard = getCSSVar('--card-bg') || '#fdf9ef';
    // 保证最低 0.78 不透明度，背景图不透过文字
    const alpha = Math.min(1, 0.78 + (opacity / 100) * 0.2);
    const rgba = hexToRgba(baseCard, alpha);
    
    const panels = document.querySelectorAll('header, .time-section, .quote-section, .countdown-panel, .settings-panel');
    panels.forEach(panel => {
        panel.style.backgroundColor = rgba;
        panel.style.backdropFilter = `blur(${blurValue}px)`;
    });
    
    if (elements.opacityValue) elements.opacityValue.textContent = opacity;
    if (elements.blurValue) elements.blurValue.textContent = blurValue.toFixed(1);
}

function getCSSVar(name) {
    try {
        return getComputedStyle(document.body).getPropertyValue(name).trim() || null;
    } catch(e) { return null; }
}

function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    let r, g, b;
    if (hex.length >= 6) {
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
    } else {
        return hex;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resetStyleSettings() {
    if(confirm('确定要重置样式设置吗？')) {
        opacity = 70;
        blur = 5;
        if (elements.opacitySlider) elements.opacitySlider.value = opacity;
        if (elements.blurSlider) elements.blurSlider.value = blur;
        applyStyleSettings();
        saveSettings();
        showToast('样式设置已重置为默认值！');
    }
}
