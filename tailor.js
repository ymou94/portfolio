/* Shared portfolio tailoring engine.
   Each page defines window.TAILORED = { <company-slug>: { <element-id>: 'replacement text' | {html: '...'} } }
   before including this script.
   Visit any page with ?<slug> (e.g. ?sofi) to apply that company's overrides — ?for=<slug> also works.
   The slug persists across internal navigation via sessionStorage. */
(function () {
  var STORAGE_KEY = 'portfolio_for';
  var params = new URLSearchParams(window.location.search);
  var slug = params.get('for');

  if (!slug) {
    // bare ?companyname form: find a param key that matches a configured slug on this page
    var knownSlugs = window.TAILORED ? Object.keys(window.TAILORED) : [];
    for (var key of params.keys()) {
      if (knownSlugs.indexOf(key.toLowerCase()) !== -1) {
        slug = key;
        break;
      }
    }
  }

  if (slug) {
    sessionStorage.setItem(STORAGE_KEY, slug.toLowerCase());
  } else {
    slug = sessionStorage.getItem(STORAGE_KEY);
  }
  if (!slug) return;
  slug = slug.toLowerCase();

  function carryParamOnInternalLinks() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || /^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('#') || /\.pdf($|\?)/.test(href)) {
        return;
      }
      var url = new URL(href, window.location.href);
      url.search = '';
      url.searchParams.set(slug, '');
      var query = url.search.replace(/=$/, '').replace(/=&/g, '&');
      a.setAttribute('href', url.pathname + query + url.hash);
    });
  }

  function applyOverrides() {
    var overrides = window.TAILORED && window.TAILORED[slug];
    if (!overrides) return;
    Object.keys(overrides).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var value = overrides[id];
      if (typeof value === 'string') {
        el.textContent = value;
      } else if (value && typeof value.html === 'string') {
        el.innerHTML = value.html;
      }
      el.hidden = false;
    });
  }

  function applyResume() {
    var link = document.getElementById('nav-resume-link');
    if (!link) return;
    link.setAttribute('href', 'resumes/lucy_mou_resume_' + slug + '.pdf');
  }

  document.addEventListener('DOMContentLoaded', function () {
    carryParamOnInternalLinks();
    applyOverrides();
    applyResume();
  });
})();
