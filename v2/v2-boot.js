/* Exécuté avant l'affichage : active les styles JS et décide si l'intro joue. */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = sessionStorage.getItem('dh-intro') === '1'; } catch (e) {}
  if (!reduce && !seen) d.classList.add('has-intro');
})();
