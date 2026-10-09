// ======================== 全局变量和DOM元素引用 ========================

// DOM元素引用
const elements = {
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    milliseconds: document.getElementById('milliseconds'),
    colonAfterHour: document.getElementById('colonAfterHour'),
    colonAfterMinute: document.getElementById('colonAfterMinute'),
    dateDisplay: document.getElementById('dateDisplay'),
    quoteContent: document.getElementById('quoteContent'),
    quoteText: document.querySelector('.quote-text'),
    quoteAuthor: document.getElementById('quoteAuthor'),
    quoteType: document.getElementById('quoteType'),
    apiStatus: document.getElementById('apiStatus'),
    apiStatusText: document.getElementById('apiStatusText'),
    settingsPanel: document.getElementById('settingsPanel'),
    container: document.querySelector('.container'),
    gaokaoCountdown: document.getElementById('gaokaoCountdown'),
    gaokaoText: document.getElementById('gaokaoText'),
    quoteProgressBar: document.getElementById('quoteProgressBar'),
    bgProgress: document.getElementById('bgProgress'),
    bgProgressBar: document.getElementById('bgProgressBar'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    drawerToggle: document.getElementById('drawerToggle'),
    drawerOverlay: document.getElementById('drawerOverlay'),
    quickDrawer: document.getElementById('quickDrawer'),
    drawerClose: document.getElementById('drawerClose'),
    drawerQuote: document.getElementById('drawerQuote'),
    drawerBg: document.getElementById('drawerBg'),
    drawerTheme: document.getElementById('drawerTheme'),
    drawerOutfit: document.getElementById('drawerOutfit'),
    extStatus: document.getElementById('extStatus'),
    extStatusText: document.getElementById('extStatusText'),
    downloadExtBtn: document.getElementById('downloadExtBtn'),
    nextExamContainer: document.getElementById('nextExamContainer'),
    nextExamText: document.getElementById('nextExamText'),
    topCountdowns: document.getElementById('topCountdowns'),
    countdownPanelItems: document.getElementById('countdownPanelItems'),
    countdownsList: document.getElementById('countdownsList'),
    showHolidayImageCheckbox: document.getElementById('showHolidayImage'),
    aboutBtn: document.getElementById('aboutBtn'),
    bgLoader: document.getElementById('bgLoader'),
    countdownSidebar: document.getElementById('countdownSidebar'),
    tagFilterGroup: document.getElementById('tagFilterGroup'),
    bgLayer1: document.getElementById('bg-layer-1'),
    bgLayer2: document.getElementById('bg-layer-2'),
    showDateCheckbox: document.getElementById('showDate'),
    showSecondsCheckbox: document.getElementById('showSeconds'),
    showMillisecondsCheckbox: document.getElementById('showMilliseconds'),
    showGaokaoCheckbox: document.getElementById('showGaokao'),
    showQuoteProgressCheckbox: document.getElementById('showQuoteProgress'),
    showBgProgressCheckbox: document.getElementById('showBgProgress'),
    bgUrlInput: document.getElementById('bgUrl'),
    bgLocalBtn: document.getElementById('bgLocalBtn'),
    saveBgBtn: document.getElementById('saveBgBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    themeBtn: document.getElementById('themeBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    cancelSettingsBtn: document.getElementById('cancelSettingsBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    selectAllBtn: document.getElementById('selectAllBtn'),
    deselectAllBtn: document.getElementById('deselectAllBtn'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    quoteIntervalInput: document.getElementById('quoteInterval'),
    bgIntervalInput: document.getElementById('bgInterval'),
    refreshQuoteBtn: document.getElementById('refreshQuoteBtn'),
    refreshBgBtn: document.getElementById('refreshBgBtn'),
    resetBtn: document.getElementById('resetBtn'),
    quotePriorityRadio: document.getElementById('quotePriority'),
    timePriorityRadio: document.getElementById('timePriority'),
    extensionTypeCheckbox: document.getElementById('extensionType'),
    toggleGuaranteeBtn: document.getElementById('toggleGuaranteeBtn'),
    countdownTitleInput: document.getElementById('countdownTitle'),
    countdownDateInput: document.getElementById('countdownDate'),
    addCountdownBtn: document.getElementById('addCountdownBtn'),
    typewriterAnimationRadio: document.getElementById('typewriterAnimation'),
    noAnimationRadio: document.getElementById('noAnimation'),
    countdownPanel: document.getElementById('countdownPanel'),
    exportSettingsBtn: document.getElementById('exportSettingsBtn'),
    importSettingsBtn: document.getElementById('importSettingsBtn'),
    importFileInput: document.getElementById('importFileInput'),
    opacitySlider: document.getElementById('opacitySlider'),
    opacityValue: document.getElementById('opacityValue'),
    blurSlider: document.getElementById('blurSlider'),
    blurValue: document.getElementById('blurValue'),
    resetStyleBtn: document.getElementById('resetStyleBtn'),
    themeSelector: document.getElementById('themeSelector'),
    themeCards: document.querySelectorAll('.theme-card'),
    currentThemeName: document.getElementById('currentThemeName'),
    currentThemeDesc: document.getElementById('currentThemeDesc'),
    followSystemTheme: document.getElementById('followSystemTheme'),
    themePreview: document.getElementById('themePreview'),
    outfitSelector: document.getElementById('outfitSelector'),
    outfitCards: document.querySelectorAll('.outfit-card'),
    currentOutfitName: document.getElementById('currentOutfitName'),
    currentOutfitDesc: document.getElementById('currentOutfitDesc')
};

// 全局状态变量
let currentTheme = 'light';
const themes = ['light', 'dark', 'ocean', 'forest', 'sunset', 'midnight', 'sakura', 'high-contrast', 'minimal', 'nature', 'dawn', 'paper', 'studynight', 'nebula'];
let currentThemeIndex = 0;
let followSystemTheme = false;

// ============ 套装系统 ============
// 套装 = 完整视觉皮肤（布局/组件/字体/配色/装饰全部独立），每套一个完整 CSS 包
// 手账(shouzhang) 使用现有全局 CSS 作为基底；其余套装通过 body.outfit-<id> 独立覆盖
const outfits = [
    {
        id: 'shouzhang',
        name: '纸上时光',
        desc: '手账纸片 · 胶带马克笔，温暖治愈',
        defaultTheme: 'light',
        themes: ['light', 'dark', 'ocean', 'forest', 'sunset', 'midnight', 'sakura', 'high-contrast', 'minimal', 'nature', 'dawn', 'paper', 'studynight', 'nebula']
    },
    {
        id: 'macaron',
        name: '甜梦巴黎',
        desc: '马卡龙玻璃拟态 · 粉彩梦幻',
        defaultTheme: 'light',
        themes: ['light', 'dark', 'ocean', 'forest', 'sunset', 'midnight', 'sakura', 'high-contrast', 'minimal', 'nature', 'dawn', 'paper', 'studynight', 'nebula']
    },
    {
        id: 'kawaii',
        name: '萌力全开',
        desc: '高饱和可爱 · 软萌圆润',
        defaultTheme: 'light',
        themes: ['light', 'sakura', 'dawn', 'paper', 'nebula', 'sunset']
    },
    {
        id: 'cyberpunk',
        name: '霓虹都市',
        desc: '赛博朋克 · 霓虹全息',
        defaultTheme: 'dark',
        themes: ['dark', 'midnight', 'studynight', 'ocean', 'nebula']
    },
    {
        id: 'editorial',
        name: '纸墨宣言',
        desc: '杂志大字报 · 大胆 editorial',
        defaultTheme: 'dark',
        themes: ['dark', 'light', 'minimal', 'high-contrast']
    },
    {
        id: 'vintage',
        name: '旧日终端',
        desc: '极致复古 · 电子管/翻页钟/CRT',
        defaultTheme: 'dark',
        themes: ['dark', 'midnight', 'studynight', 'sunset']
    }
];
let currentOutfit = 'shouzhang';
const outfitDisplayNames = {};
outfits.forEach(o => { outfitDisplayNames[o.id] = o.name; });

// 主题描述信息
const themeDescriptions = {
    'light': '简洁明亮的浅色主题，适合日常使用',
    'dark': '深色主题，适合夜间使用，减少眼睛疲劳',
    'ocean': '海洋主题，以蓝色为主色调，营造宁静氛围',
    'forest': '森林主题，以绿色为主色调，充满自然气息',
    'sunset': '日落主题，以暖色调为主，温馨舒适',
    'midnight': '午夜主题，深邃神秘，适合专注工作',
    'sakura': '樱花主题，粉色系，浪漫可爱',
    'high-contrast': '高对比度主题，适合视力障碍用户，文本清晰易读',
    'minimal': '极简主题，简洁干净，减少视觉干扰',
    'nature': '自然主题，以大地色调为主，贴近自然',
    'dawn': '奶油晨曦主题，薄荷×暖金，清晨元气满满',
    'paper': '糖果纸主题，奶白纸感×淡蓝柔粉，温柔清爽',
    'studynight': '星夜自习主题，深靛蓝×暖灯橙，晚自习温馨专注',
    'nebula': '云霓主题，淡紫淡青渐变，青春梦幻'
};

let quoteTypes = ['a', 'c', 'f', 'h', 'k'];
let quoteInterval = 1;
let bgIntervalTime = 30;
let quoteStartTime = 0, bgStartTime = 0, quoteDuration = 0, bgDuration = 0;
let currentPreset = null, customBg = null, isTyping = false, lastProgressUpdate = Date.now();
let tempSettings = null, animationFrameId = null, quoteAnimationFrame = null, bgAnimationFrame = null;
let currentBgUrl = '', timeOffset = 0, lastTimeSync = 0;
let extensionQuotes = [], displayPriority = 'quote', downloadRetryCount = 0;
const maxRetries = 10;
let consecutiveNonExtension = 0, enableQuoteGuarantee = true;
let countdowns = [], editingCountdownId = null;
let quoteAnimationType = 'typewriter', showHolidayImage = true;
let activeBgLayer = elements.bgLayer1, inactiveBgLayer = elements.bgLayer2;
let bgLoading = false, bgClearTimeout = null, filteredTags = [], allTags = [], bgInterval = null;
let opacity = 70, blur = 5;
let nextBgUrl = null, isPreloading = false;

// 高考科目
const examSubjects = [
    { name: "语文", date: "06-07", startTime: "09:00", endTime: "11:30" },
    { name: "数学", date: "06-07", startTime: "15:00", endTime: "17:00" },
    { name: "物理/历史", date: "06-08", startTime: "09:00", endTime: "10:15" },
    { name: "外语", date: "06-08", startTime: "15:00", endTime: "17:00" },
    { name: "化学", date: "06-09", startTime: "08:30", endTime: "09:45" },
    { name: "地理", date: "06-09", startTime: "11:00", endTime: "12:15" },
    { name: "政治", date: "06-09", startTime: "14:30", endTime: "15:45" },
    { name: "生物", date: "06-09", startTime: "17:00", endTime: "18:15" }
];
let ignoredSubjects = [];

// 示例扩展金句 & 本地备用库
const sampleExtensionQuotes = [
    { hitokoto: "生活不止眼前的苟且，还有诗和远方。", from: "高晓松", from_who: "", type: "m", tag: ["励志","生活"] },
    { hitokoto: "成功的秘诀在于坚持自己的梦想。", from: "马云", from_who: "", type: "m", tag: ["成功","励志"] },
    { hitokoto: "学习如逆水行舟，不进则退。", from: "《增广贤文》", from_who: "", type: "m", tag: ["学习","励志"] },
    { hitokoto: "世上无难事，只要肯登攀。", from: "毛泽东", from_who: "", type: "m", tag: ["励志","奋斗"] },
    { hitokoto: "知识就是力量。", from: "培根", from_who: "", type: "m", tag: ["学习","知识"] },
    { hitokoto: "一个男人不会因为年龄的成长而成长，而是经历某些事情后才会成长", from: "徐天乐", from_who: "鸿鹄一班", type: "e", tag: ["成长","人生"] }
];
const localQuotes = [
    {quote: "宝剑锋从磨砺出，梅花香自苦寒来", author: "出自：《警世贤文》", type: "文学"},
    {quote: "不积跬步，无以至千里；不积小流，无以成江海", author: "出自：荀子《劝学》", type: "文学"},
    {quote: "青春须早为，岂能长少年", author: "出自：孟郊《劝学》", type: "文学"},
    {quote: "成功不是将来才有的，而是从决定去做的那一刻起，持续累积而成", author: "俞敏洪", type: "励志"},
    {quote: "学习如逆水行舟，不进则退", author: "中国谚语", type: "网络"},
    {quote: "时间就像海绵里的水，只要愿挤，总还是有的", author: "鲁迅", type: "文学"},
    {quote: "坚持就是胜利，努力就有收获", author: "佚名", type: "网络"},
    {quote: "书山有路勤为径，学海无涯苦作舟", author: "出自：《增广贤文》", type: "文学"},
    {quote: "机会总是留给有准备的人", author: "路易·巴斯德", type: "励志"},
    {quote: "今天的努力，明天的实力", author: "佚名", type: "网络"}
];

const bgPresets = {
    none: '', weimei: 'https://t.alcy.cc/fj', bluearchive: 'https://rba.kanostar.top/adapt',
    anime: 'https://imgapi.xl0408.top/index.php', yuanshen: 'https://api.suyanw.cn/api/ys',
    random: ['https://t.alcy.cc/fj','https://rba.kanostar.top/adapt','https://imgapi.xl0408.top/index.php','https://api.suyanw.cn/api/ys']
};
