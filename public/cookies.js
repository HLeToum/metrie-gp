/* ================================================================
   Metrie GP — Cookie consent banner (CNIL-compliant)
   ----------------------------------------------------------------
   • Asks consent BEFORE any non-essential cookie
   • "Refuser" is as easy as "Accepter" (1 click, equal prominence)
   • Granular per-category preferences
   • Choice stored 6 months (CNIL recommendation), then re-asked
   • window.MetrieCookies.open() reopens the modal from a footer link
   • Dispatches CustomEvent("cookie-consent") so analytics scripts
     can hook in once the user opts in (none used today).
   ================================================================ */
(function () {
  'use strict';

  var KEY = 'metrie-gp-consent-v1';
  var VERSION = '1.0';
  var EXPIRY_MS = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months

  // ---------- storage ----------
  function readConsent() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.expires && data.expires < Date.now()) return null;
      if (data.version !== VERSION) return null;
      return data;
    } catch (e) { return null; }
  }

  function saveConsent(prefs) {
    var data = {
      version: VERSION,
      essential: true,
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing,
      timestamp: new Date().toISOString(),
      expires: Date.now() + EXPIRY_MS
    };
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
    applyConsent(data);
    return data;
  }

  function applyConsent(data) {
    // Hook for future analytics: load Plausible / GA4 only when opted in.
    try {
      window.dispatchEvent(new CustomEvent('cookie-consent', { detail: data }));
    } catch (e) {}
  }

  // ---------- helpers ----------
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (html != null) n.innerHTML = html;
    return n;
  }

  function trapFocus(modal) {
    var focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
    setTimeout(function () { first.focus(); }, 50);
  }

  // ---------- banner ----------
  function showBanner() {
    if (document.querySelector('.cookie-banner')) return;
    var banner = el('div', {
      'class': 'cookie-banner',
      'role': 'region',
      'aria-label': 'Consentement aux cookies'
    });
    banner.innerHTML =
      '<div class="cookie-banner-inner">' +
        '<div class="cookie-banner-text">' +
          '<strong>Cookies &amp; confidentialité</strong>' +
          '<p>Nous utilisons des cookies <strong>essentiels</strong> au fonctionnement du site (navigation, formulaire de devis, mémorisation de votre choix). Aucun cookie publicitaire ni traceur tiers n\'est déposé sans votre accord. ' +
          '<a href="confidentialite.html">En savoir plus</a></p>' +
        '</div>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="cookie-btn cookie-btn-secondary" data-act="refuse">Tout refuser</button>' +
          '<button type="button" class="cookie-btn cookie-btn-secondary" data-act="customize">Personnaliser</button>' +
          '<button type="button" class="cookie-btn cookie-btn-primary" data-act="accept">Tout accepter</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add('cookie-banner-in'); });

    banner.querySelector('[data-act=accept]').addEventListener('click', function () {
      saveConsent({ analytics: true, marketing: true });
      banner.remove();
    });
    banner.querySelector('[data-act=refuse]').addEventListener('click', function () {
      saveConsent({ analytics: false, marketing: false });
      banner.remove();
    });
    banner.querySelector('[data-act=customize]').addEventListener('click', function () {
      banner.remove();
      showCustomize();
    });
  }

  // ---------- preferences modal ----------
  function showCustomize() {
    if (document.querySelector('.cookie-modal')) return;
    var current = readConsent() || { analytics: false, marketing: false };
    var modal = el('div', { 'class': 'cookie-modal', 'role': 'dialog', 'aria-modal': 'true', 'aria-label': 'Préférences cookies' });
    modal.innerHTML =
      '<div class="cookie-modal-card">' +
        '<header class="cookie-modal-head">' +
          '<h2>Préférences cookies</h2>' +
          '<button type="button" class="cookie-close" data-act="close" aria-label="Fermer">&times;</button>' +
        '</header>' +
        '<div class="cookie-modal-body">' +
          '<p class="cookie-intro">Choisissez quelles catégories de cookies vous autorisez. Vos préférences seront mémorisées 6 mois et peuvent être modifiées à tout moment.</p>' +
          '<div class="cookie-cat">' +
            '<div class="cookie-cat-head">' +
              '<strong>Cookies essentiels</strong>' +
              '<span class="cookie-pill cookie-pill-required">Toujours actif</span>' +
            '</div>' +
            '<p>Nécessaires au fonctionnement du site : mémorisation de votre choix de consentement, soumission du formulaire de devis, navigation. Ne peuvent pas être désactivés.</p>' +
          '</div>' +
          '<div class="cookie-cat">' +
            '<div class="cookie-cat-head">' +
              '<strong>Mesure d\'audience</strong>' +
              '<label class="cookie-switch">' +
                '<input type="checkbox" data-cat="analytics" ' + (current.analytics ? 'checked' : '') + ' />' +
                '<span class="cookie-switch-track"><span class="cookie-switch-knob"></span></span>' +
              '</label>' +
            '</div>' +
            '<p>Statistiques anonymisées de visite (pages vues, durée). <em>Aucun outil de mesure n\'est actuellement déployé sur ce site — cette catégorie est réservée pour un usage futur.</em></p>' +
          '</div>' +
          '<div class="cookie-cat">' +
            '<div class="cookie-cat-head">' +
              '<strong>Marketing &amp; profilage</strong>' +
              '<label class="cookie-switch">' +
                '<input type="checkbox" data-cat="marketing" ' + (current.marketing ? 'checked' : '') + ' />' +
                '<span class="cookie-switch-track"><span class="cookie-switch-knob"></span></span>' +
              '</label>' +
            '</div>' +
            '<p>Cookies publicitaires, retargeting, traceurs tiers. <strong>Aucun cookie de cette catégorie n\'est utilisé sur ce site.</strong></p>' +
          '</div>' +
        '</div>' +
        '<footer class="cookie-modal-foot">' +
          '<button type="button" class="cookie-btn cookie-btn-secondary" data-act="refuse-all">Tout refuser</button>' +
          '<button type="button" class="cookie-btn cookie-btn-primary" data-act="save">Enregistrer mes choix</button>' +
        '</footer>' +
      '</div>';
    document.body.appendChild(modal);
    requestAnimationFrame(function () { modal.classList.add('cookie-modal-in'); });
    trapFocus(modal);

    function close() { modal.remove(); }
    modal.querySelector('[data-act=close]').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function escListener(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escListener); }
    });
    modal.querySelector('[data-act=refuse-all]').addEventListener('click', function () {
      saveConsent({ analytics: false, marketing: false });
      close();
    });
    modal.querySelector('[data-act=save]').addEventListener('click', function () {
      var analytics = modal.querySelector('[data-cat=analytics]').checked;
      var marketing = modal.querySelector('[data-cat=marketing]').checked;
      saveConsent({ analytics: analytics, marketing: marketing });
      close();
    });
  }

  // ---------- public API ----------
  window.MetrieCookies = {
    open: showCustomize,
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
    getConsent: readConsent
  };

  // ---------- init ----------
  function init() {
    var consent = readConsent();
    if (!consent) {
      // Slight delay so the banner doesn't flash before page paint
      setTimeout(showBanner, 500);
    } else {
      applyConsent(consent);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
