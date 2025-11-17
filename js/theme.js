/**
 * Theme Management
 * Shared across all pages for consistent theming
 */

// Theme switching functionality
function toggleTheme() {
    const body = document.body;
    
    body.classList.toggle('light-theme');
    
    // Save preference
    if (body.classList.contains('light-theme')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
    
    // Update charts if on analytics page
    if (typeof analyticsManager !== 'undefined' && analyticsManager.charts) {
        setTimeout(() => {
            analyticsManager.renderCharts();
        }, 100);
    }
}

// Load saved theme preference on page load
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
    }
}

// Load theme as soon as possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSavedTheme);
} else {
    loadSavedTheme();
}
