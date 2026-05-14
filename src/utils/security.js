/**
 * Utility to block developer tools based on environment variable
 */
export const initSecurity = () => {
  const blockDevTools = import.meta.env.VITE_BLOCK_DEVTOOLS === 'true';

  if (blockDevTools) {
    // 1. Disable Right Click
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Cmd+Option+I (Mac)
      if (e.metaKey && e.altKey && e.key === 'i') {
        e.preventDefault();
        return false;
      }
    });

    // 3. Debugger Loop (Heavy-duty protection)
    // This can sometimes be annoying during development, but it's effective
    // setInterval(() => {
    //   debugger;
    // }, 100);
  }
};
