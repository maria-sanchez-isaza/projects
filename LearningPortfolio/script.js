const formButton = document.querySelector('.form-toggle');
const formPanel = document.getElementById('week-02-form');

if (formButton && formPanel) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let hideTimer = 0;

  formButton.hidden = false;

  formButton.addEventListener('click', () => {
    const isOpen = formButton.getAttribute('aria-expanded') === 'true';

    window.clearTimeout(hideTimer);

    if (isOpen) {
      if (formPanel.contains(document.activeElement)) formButton.focus();
      formButton.setAttribute('aria-expanded', 'false');
      formButton.textContent = 'Show feedback form';
      formPanel.inert = true;
      formPanel.setAttribute('aria-hidden', 'true');
      formPanel.classList.remove('is-open');

      if (reducedMotion.matches) {
        formPanel.hidden = true;
      } else {
        hideTimer = window.setTimeout(() => {
          if (formButton.getAttribute('aria-expanded') === 'false') formPanel.hidden = true;
        }, 280);
      }
    } else {
      formButton.setAttribute('aria-expanded', 'true');
      formButton.textContent = 'Hide feedback form';
      formPanel.hidden = false;
      formPanel.inert = false;
      formPanel.removeAttribute('aria-hidden');

      if (reducedMotion.matches) {
        formPanel.classList.add('is-open');
      } else {
        formPanel.getBoundingClientRect();
        formPanel.classList.add('is-open');
      }
    }
  });
}
