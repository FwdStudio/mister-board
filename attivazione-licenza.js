/* ============================================================
   MODULO DI ATTIVAZIONE LICENZA — Lemon Squeezy
   Riutilizzabile su ogni PWA: cambia solo le 3 righe qui sotto.
   ============================================================ */
(function () {

  // 1) Da compilare quando crei il prodotto "Mister Board" su Lemon Squeezy:
  //    - LS_STORE_ID: lo trovi in Settings > General del tuo store
  //    - LS_PRODUCT_ID: lo trovi nella pagina del prodotto (URL o dettagli)
  const LS_STORE_ID = 439557;
  const LS_PRODUCT_ID = 1247953;

  // 2) Nome univoco per SALVARE la licenza di QUESTA pwa nel telefono.
  //    Su un'altra PWA (es. Scout Avversari) cambia questa stringa,
  //    altrimenti le due app si "confonderebbero" a vicenda.
  const STORAGE_KEY = 'fwd_license_misterboard';

  function getSavedLicense() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return null;
    }
  }

  function saveLicense(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Vero se questo dispositivo ha già una licenza valida salvata.
  function isUnlocked() {
    const saved = getSavedLicense();
    return !!(saved && saved.unlocked === true);
  }

  // Prova ad attivare un codice inserito dall'utente.
  // Ritorna una Promise: si risolve se va a buon fine,
  // altrimenti lancia un errore con un messaggio leggibile.
  async function activateLicense(key) {
    const instanceName = 'MisterBoard-' + Date.now();

    let response;
    try {
      response = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new URLSearchParams({
          license_key: key,
          instance_name: instanceName
        })
      });
    } catch (e) {
      throw new Error('Connessione assente. Riprova quando sei online.');
    }

    const data = await response.json();

    if (!data.activated) {
      throw new Error(data.error || 'Codice non valido.');
    }

    // Controllo di sicurezza: la licenza deve appartenere a QUESTO prodotto.
    if (data.meta.store_id !== LS_STORE_ID || data.meta.product_id !== LS_PRODUCT_ID) {
      throw new Error('Questo codice non è valido per questa app.');
    }

    saveLicense({
      licenseKey: key,
      instanceId: data.instance.id,
      unlocked: true
    });

    return true;
  }

  // Espone le due funzioni al resto della pagina.
  window.FwdLicense = { activateLicense, isUnlocked };

})();
