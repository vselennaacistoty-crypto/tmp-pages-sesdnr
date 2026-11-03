/* Главная (редизайн 10.10.2026): калькулятор, окно заявки, мобильное меню, появление блоков.
   Основа — app.js прототипа владельца. Отличие: в окне настоящая форма (её отправляет общий
   /app.js в /send.php с целью «lead»), а контекст кнопки уходит в заявку полем source.
   Цены — прайс /ceny/ (с 11.10.2026 минимум 3 000 ₽); меняется прайс — поменяй и здесь. */
(function () {
  'use strict';
  var catalog = {
    flat: [['1-комнатная квартира', 3000, 3000, 3600], ['2-комнатная квартира', 3000, 3000, 3800], ['3-комнатная квартира', 3000, 3000, 4000], ['4-комнатная квартира', 3000, 3200, 4200]],
    house: [['Дом до 100 м²', 3500, 4500, 5500], ['Дом до 200 м²', 4500, 5500, 6500], ['Участок до 10 соток', 3000, 4000, 5000], ['Участок до 20 соток', 4000, 5000, 6000]],
    business: [['Офис до 100 м²', 3000, 4000, 5000], ['Кафе, ресторан', 5000, 7000, 9000], ['Склад, производство', 8000, 11000, 14000], ['Транспорт (за единицу)', 3000, 3500, 4500]]
  };
  var d = document;
  var category = 'flat';
  var object = d.querySelector('#object'), method = d.querySelector('#method'), price = d.querySelector('#price'), context = d.querySelector('#price-context');

  function updatePrice() {
    var row = catalog[category][Number(object.value)];
    price.textContent = new Intl.NumberFormat('ru-RU').format(row[Number(method.value) + 1]);
    context.textContent = row[0];
  }
  function setCategory(next) {
    category = next;
    object.replaceChildren.apply(object, catalog[next].map(function (row, i) {
      var opt = d.createElement('option'); opt.value = i; opt.textContent = row[0]; return opt;
    }));
    d.querySelectorAll('[data-category]').forEach(function (b) {
      var selected = b.dataset.category === next;
      b.classList.toggle('active', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    updatePrice();
  }
  if (object && method && price && context) {
    d.querySelectorAll('[data-category]').forEach(function (b) { b.addEventListener('click', function () { setCategory(b.dataset.category); }); });
    object.addEventListener('change', updatePrice);
    method.addEventListener('change', updatePrice);
    setCategory('flat');
  }

  /* ---------- Окно заявки ---------- */
  var dialog = d.querySelector('#booking');
  var priorFocus = null;
  function book(text) {
    if (!dialog) return;
    priorFocus = d.activeElement;
    d.querySelector('#booking-context').textContent = text;
    var src = dialog.querySelector('input[name="source"]');
    if (src) src.value = 'Главная: ' + text;
    var note = dialog.querySelector('.form-note');
    if (note) { note.className = 'form-note'; note.textContent = ''; }
    dialog.showModal();
    var name = dialog.querySelector('input[name="name"]');
    if (name) name.focus();
  }
  d.querySelectorAll('[data-book]').forEach(function (b) { b.addEventListener('click', function () { book(b.dataset.book); }); });
  var calcBook = d.querySelector('#calc-book');
  if (calcBook) calcBook.addEventListener('click', function () {
    book(context.textContent + ' · ' + method.selectedOptions[0].textContent + '. Базовая стоимость — от ' + price.textContent + ' ₽.');
  });
  if (dialog) {
    d.querySelector('.dialog-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) {
      if (e.target !== dialog) return;
      var r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
    dialog.addEventListener('close', function () { if (priorFocus && priorFocus.focus) priorFocus.focus(); });
  }

  /* ---------- Мобильное меню ---------- */
  var menu = d.querySelector('.menu-btn'), nav = d.querySelector('#nav');
  function closeMenu() {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Открыть меню');
  }
  if (menu && nav) {
    menu.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Появление блоков при прокрутке ---------- */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      });
    }, { threshold: .08 });
    d.querySelectorAll('.reveal').forEach(function (el) {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('will-reveal'); observer.observe(el); }
    });
  }
})();
