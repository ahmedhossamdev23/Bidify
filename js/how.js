// Dark Mode Toggle
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('bidify_darkmode', isDark);
});

// Load saved dark mode
if (localStorage.getItem('bidify_darkmode') === 'true') {
  document.body.classList.add('dark');
  darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}