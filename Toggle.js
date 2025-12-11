// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');

function initTheme() {
    const savedTheme = localStorage.getItem('quizTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('quizTheme', isDark ? 'dark' : 'light');
}