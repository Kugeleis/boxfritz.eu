import aboutHtml from '../about.md';

document.addEventListener('DOMContentLoaded', () => {
  const aboutContentElement = document.getElementById('about-content');
  if (aboutContentElement) {
    aboutContentElement.innerHTML = aboutHtml;
  }

  const appVersionElement = document.getElementById('app-version');
  if (appVersionElement) {
    appVersionElement.textContent = __APP_VERSION__;
  }

  const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement;
  if (themeToggle) {
    themeToggle.checked = document.documentElement.getAttribute('data-theme') === 'dark';

    themeToggle.addEventListener('change', (e) => {
      const isDark = (e.target as HTMLInputElement).checked;
      const theme = isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });
  }
});