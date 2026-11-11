const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

function setMenuOpen(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  mobileNav.hidden = !open;
}

menuButton.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});

mobileNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuButton.focus();
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
