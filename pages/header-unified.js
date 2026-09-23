/* ══════════════════════════════════════════════════════════════════
   HEADER SARLAVHASINI MOSLASH
   Sarlavha header ichiga sigʻmasa (masalan RU/EN tarjimasi uzunroq),
   shrift bosqichma-bosqich kichrayadi — koʻpi bilan 2 qator boʻladi.
   Balandlik oʻzgarmaydi: barcha sahifalarda header bir xil qoladi.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var SEL = [
    '.silk-road-header .silk-road-header-brand h1',
    '.yi-top h1',
    '#ti-nav .ti-brand',
    '#yq-nav .yq-brand',
    '.hdr-u .hdr-u-title'
  ].join(',');

  var MAX_LINES = 2;
  var MIN_RATIO = 0.5;   /* bazaviy shriftning 50% idan kichik boʻlmaydi */
  var STEP      = 0.04;  /* har qadamda 4% */

  function num(v){ var n = parseFloat(v); return isNaN(n) ? 0 : n; }

  /* clamp ni vaqtincha oʻchirib, matnning haqiqiy balandligini oʻlchaydi */
  function naturalHeight(el){
    var d = el.style.display, c = el.style.webkitLineClamp, o = el.style.overflow;
    el.style.display = 'block';
    el.style.webkitLineClamp = 'unset';
    el.style.overflow = 'visible';
    var h = el.scrollHeight;
    el.style.display = d; el.style.webkitLineClamp = c; el.style.overflow = o;
    return h;
  }

  function fit(el){
    var head = el.closest('header');
    if (!head) return;

    /* header ichida matnga ajratilgan balandlik */
    var hs    = getComputedStyle(head);
    var avail = head.clientHeight - num(hs.paddingTop) - num(hs.paddingBottom);

    /* sarlavha ustidagi/ostidagi qoʻshni satrlar (masalan .yi-sub) ham
       shu balandlikni band qiladi — ularni ayiramiz */
    var par = el.parentElement;
    if (par && par !== head && getComputedStyle(par).flexDirection === 'column'){
      for (var k = 0; k < par.children.length; k++){
        var ch = par.children[k];
        if (ch === el) continue;
        if (getComputedStyle(ch).position === 'absolute') continue;
        avail -= ch.offsetHeight;
      }
    }
    if (avail <= 0) return;

    /* ustki kichik satr (b) oʻz joyini oladi */
    var b  = el.querySelector('b');
    var bh = b ? b.offsetHeight + num(getComputedStyle(b).marginBottom) : 0;

    el.style.fontSize = '';                       /* CSS dagi bazaga qaytamiz */
    var base = num(getComputedStyle(el).fontSize);
    if (!base) return;

    for (var i = 0; i <= 13; i++){
      var size = base * (1 - i * STEP);
      if (size < base * MIN_RATIO) size = base * MIN_RATIO;
      el.style.fontSize = size + 'px';

      var lh = num(getComputedStyle(el).lineHeight) || size * 1.2;
      if (b) bh = b.offsetHeight + num(getComputedStyle(b).marginBottom);

      var h     = naturalHeight(el);
      var lines = Math.round((h - bh) / lh);

      if (h <= avail && lines <= MAX_LINES) return;
      if (size <= base * MIN_RATIO) return;       /* eng kichik chegara */
    }
  }

  function fitAll(){
    var els = document.querySelectorAll(SEL), i;
    for (i = 0; i < els.length; i++) fit(els[i]);
  }

  var timer = null;
  function schedule(){
    /* rAF dan foydalanmaymiz: fondagi/koʻrinmas freymda u toʻxtatiladi */
    if (timer) clearTimeout(timer);
    timer = setTimeout(function(){ timer = null; fitAll(); }, 40);
  }

  function start(){
    fitAll();

    /* til almashganda matn oʻzgaradi — qayta oʻlchaymiz */
    var els = document.querySelectorAll(SEL), i;
    var mo  = new MutationObserver(schedule);
    for (i = 0; i < els.length; i++){
      mo.observe(els[i], {childList:true, characterData:true, subtree:true});
    }

    window.addEventListener('resize', schedule);
    /* shriftlar kech yuklansa — qayta oʻlchaymiz */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    window.addEventListener('load', schedule);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
