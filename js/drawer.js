// ======================== 快捷操作抽屉 ========================

function openDrawer() {
    elements.quickDrawer.classList.add('open');
    elements.drawerOverlay.classList.add('open');
    elements.quickDrawer.setAttribute('aria-hidden', 'false');
    if (elements.drawerToggle) {
        elements.drawerToggle.setAttribute('aria-expanded', 'true');
    }
}

function closeDrawer() {
    elements.quickDrawer.classList.remove('open');
    elements.drawerOverlay.classList.remove('open');
    elements.quickDrawer.setAttribute('aria-hidden', 'true');
    if (elements.drawerToggle) {
        elements.drawerToggle.setAttribute('aria-expanded', 'false');
    }
}
