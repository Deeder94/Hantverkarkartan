(() => {
  let mapReady = false;
  let failed = false;

  function statusElement() { return document.getElementById('map-status'); }
  function showFailure(message) {
    if (mapReady) return;
    failed = true;
    const el = statusElement();
    if (el) {
      el.textContent = message || 'Kartan kunde inte starta. Kontrollera internetanslutningen och ladda om sidan.';
      el.dataset.kind = 'error';
    }
  }

  window.HK_BOOT = {
    moduleStarted() { document.documentElement.dataset.hkModule = 'started'; },
    mapReady() { mapReady = true; document.documentElement.dataset.hkReady = 'true'; },
    fail(message) { showFailure(message); }
  };

  window.addEventListener('error', (event) => {
    if (mapReady) return;
    const target = event.target;
    if (target && target.tagName === 'SCRIPT') {
      showFailure('En nödvändig kartkomponent kunde inte laddas. Kontrollera internetanslutningen och ladda om sidan.');
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (!mapReady) {
      console.error('Ohanterat uppstarts-/modulfel:', event.reason);
      showFailure('Kartan kunde inte starta korrekt. Ladda om sidan och kontrollera internetanslutningen.');
    }
  });

  setTimeout(() => {
    if (mapReady || failed) return;
    if (document.documentElement.dataset.hkModule !== 'started') {
      showFailure('Kartan kunde inte starta eftersom en JavaScript-komponent inte laddades. Kontrollera internetanslutningen och ladda om sidan.');
    }
  }, 6000);
})();
