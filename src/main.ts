// src/main.ts
import 'nouislider/dist/nouislider.css';
import './style.css';
import './theme.css';
import { initializeApp } from './app';

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();

  const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement;
  if (themeToggle) {
    // Set initial state based on current theme
    themeToggle.checked = document.documentElement.getAttribute('data-theme') === 'dark';

    themeToggle.addEventListener('change', (e) => {
      const isDark = (e.target as HTMLInputElement).checked;
      const theme = isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });
  }
});
