/* Sistema de temas — independente do resto do site. Carregado no <head> para evitar "flash". */
(function () {
  var KEY = 'cct-theme', root = document.documentElement;
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(t) { try { localStorage.setItem(KEY, t); } catch (e) {} }
  var t = get() || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', t);

  document.addEventListener('DOMContentLoaded', function () {
    var btns = document.querySelectorAll('[data-theme-toggle]');
    function sync() {
      var cur = root.getAttribute('data-theme');
      btns.forEach(function (b) {
        b.setAttribute('aria-pressed', String(cur === 'dark'));
        b.setAttribute('aria-label', cur === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        root.classList.add('theme-anim');
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        set(next); sync();
        setTimeout(function () { root.classList.remove('theme-anim'); }, 500);
      });
    });
    sync();
  });
})();
