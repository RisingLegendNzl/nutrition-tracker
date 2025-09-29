// Entry point for the Nutrify app.
// Make the boot process visible and resilient so it’s easy to debug on phone-only.

(function boot() {
  const root = document.getElementById('app');
  if (root) {
    root.textContent = 'Nutrify: loading UI…';
  }

  // Dynamically import so we can surface load errors in the UI (not just console)
  import('./diet.js')
    .then((mod) => {
      // diet.js auto-inits, but show a small status in case it takes a moment
      if (root) {
        // If diet.js mounted the UI, it will overwrite this container.
        // If not, keep a subtle status.
        root.textContent = root.textContent || 'Nutrify UI ready.';
      }
      console.log('Nutrify app loaded');
    })
    .catch((err) => {
      console.error('Failed to load diet.js', err);
      if (root) {
        const pre = document.createElement('pre');
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.padding = '1rem';
        pre.style.border = '1px solid #ddd';
        pre.style.background = '#fff7f7';
        pre.textContent =
          'Error loading UI. Try a hard refresh.\n\n' +
          (err && (err.message || String(err)));
        root.innerHTML = '';
        root.appendChild(pre);
      }
    });
})();