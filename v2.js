/* =========================================================
   DYANI HOSPITALITY — v2
   Aucune dépendance. Tout est désactivé proprement si
   prefers-reduced-motion est actif.
   ========================================================= */

/* ============================================================
   COORDONNÉES — PROTECTION CONTRE LES ROBOTS COLLECTEURS
   Reprise à l'identique de assets/js/main.js : les coordonnées
   ne figurent en clair ni dans le HTML, ni dans ce fichier.
   Elles sont encodées en base64 et reconstituées par le
   navigateur au moment de l'affichage. Un aspirateur d'adresses
   qui lit la source ne trouve rien.

   POUR MODIFIER UNE COORDONNÉE
   Ouvrir la console du navigateur et exécuter :
       btoa('nouvelle-valeur')
   puis coller le résultat ci-dessous.
     _e -> adresse e-mail
     _w -> numéro WhatsApp, format international sans + ni espace
     _t -> numéro affiché, lisible
   ============================================================ */
const _c = {
  _e: 'Y29udGFjdEBkeWFuaWhvc3BpdGFsaXR5LmNvbQ==',
  _w: 'MzI0ODQ2NTAzNTM=',
  _t: 'KzMyIDQ4NCA2NSAwMyA1Mw=='
};
function _d(s){ try { return decodeURIComponent(escape(window.atob(s))); } catch (e) { return ''; } }

/* ============================================================
   ENVOI DU FORMULAIRE — WEB3FORMS
   Le message composé est déposé sur api.web3forms.com, qui le
   relaie vers la boîte rattachée à la clé ci-dessous.

   POUR CHANGER DE BOÎTE DE RÉCEPTION
     1. créer un accès sur web3forms.com avec l'adresse voulue ;
     2. coller la clé reçue (« Access Key ») dans web3formsKey.
   Cette clé est publique par nature : elle n'autorise que le
   dépôt d'un message vers la boîte qui lui est rattachée.
   Clé vide = ouverture du logiciel de messagerie du visiteur.
   ============================================================ */
const CONFIG = {
  get email(){ return _d(_c._e); },
  get whatsapp(){ return _d(_c._w); },   // format international, sans + ni espaces
  get tel(){ return _d(_c._t); },        // forme affichée, lisible
  web3formsKey: 'dfe45568-2244-4601-9270-ad50d3cbe411'   // boîte contact@dyanihospitality.com (Zoho)
};

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const html = document.documentElement;
  /* Langue de la page consultée : l'objet de l'e-mail, les libellés
     d'état et le message composé en découlent. Même principe que
     assets/js/main.js. */
  const EN = html.lang === 'en';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasIntro = html.classList.contains('has-intro');
  const introDelay = hasIntro ? 1450 : 0;

  /* ---------- intro ---------- */
  if (hasIntro) {
    try { sessionStorage.setItem('dh-intro', '1'); } catch (e) {}
    setTimeout(() => { const i = $('#intro'); i && i.remove(); }, 2500);
  }

  /* ---------- découpage en mots (titres) ---------- */
  function splitWords(el) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    $$('.w > span', el).forEach((s, k) => { s.style.transitionDelay = (k * 0.045) + 's'; });
  }
  if (!reduce) $$('.split, .split-words').forEach(splitWords);

  /* ---------- apparitions ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

  const heroEls = $$('.hero .rv, .hero .split');
  $$('.rv, .split-words, .flow, .chain').forEach((el) => {
    if (!heroEls.includes(el)) io.observe(el);
  });
  // une image masquée (clip-path) n'est jamais « visible » pour l'observateur :
  // on observe donc son conteneur.
  const rio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$('.reveal', e.target).concat(e.target.classList.contains('reveal') ? [e.target] : []).forEach((r) => r.classList.add('is-in'));
      rio.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  $$('.reveal').forEach((r) => rio.observe(r.parentElement));
  setTimeout(() => {
    heroEls.forEach((el) => el.classList.add('is-in'));
  }, introDelay + 80);

  /* ---------- compteurs ---------- */
  $$('.count').forEach((el) => {
    const to = +el.dataset.to;
    if (reduce) return;
    const from = to - 14;
    el.textContent = from;
    setTimeout(() => {
      const t0 = performance.now(), dur = 1600;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, introDelay + 900);
  });

  /* ---------- header ---------- */
  const hd = $('#hd');
  let lastY = scrollY;
  const onHeader = () => {
    const y = scrollY;
    hd.classList.toggle('is-solid', y > 40);
    if (!html.classList.contains('menu-open')) hd.classList.toggle('is-hidden', y > lastY && y > 500);
    lastY = y;
    const fab = $('.fab'); fab && fab.classList.toggle('is-on', y > innerHeight * 0.8);
  };
  addEventListener('scroll', onHeader, { passive: true }); onHeader();

  // lien actif
  const navLinks = $$('.hd__nav a');
  const secIO = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['methode', 'terrain', 'constantin', 'formations', 'fondateur'].forEach((id) => { const s = document.getElementById(id); s && secIO.observe(s); });

  /* ---------- menu mobile ---------- */
  const menu = $('#menu'), burger = $('#burger');
  const focusables = () => $$('a, button', menu).concat([burger]);
  const setMenu = (open) => {
    html.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? (EN ? 'Close the menu' : 'Fermer le menu')
                                           : (EN ? 'Open the menu' : 'Ouvrir le menu'));
    if (open) { menu.hidden = false; $('#main').inert = true; setTimeout(() => $('.menu__nav a', menu).focus(), 300); showImg('methode'); }
    else { $('#main').inert = false; }
  };
  burger.addEventListener('click', () => setMenu(!html.classList.contains('menu-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  const showImg = (k) => $$('[data-menu-img]', menu).forEach((i) => i.classList.toggle('is-on', i.dataset.menuImg === k));
  $$('.menu__nav a').forEach((a) => {
    a.addEventListener('mouseenter', () => showImg(a.dataset.k));
    a.addEventListener('focus', () => showImg(a.dataset.k));
  });
  document.addEventListener('keydown', (e) => {
    if (!html.classList.contains('menu-open')) return;
    if (e.key === 'Escape') { setMenu(false); burger.focus(); }
    if (e.key === 'Tab') {
      const f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  let tx = 0;
  menu.addEventListener('touchstart', (e) => { tx = e.touches[0].clientY; }, { passive: true });
  menu.addEventListener('touchend', (e) => { if (e.changedTouches[0].clientY - tx < -90) setMenu(false); }, { passive: true });

  /* ---------- curseur ---------- */
  if (fine && !reduce) {
    const c = $('#cursor'), dot = $('.cursor__dot', c), ring = $('.cursor__ring', c), lbl = $('.cursor__lbl', c);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', (e) => { c.classList.add('is-live'); mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    const loop = () => { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('pointerover', (e) => {
      const lab = e.target.closest('[data-cursor]');
      const lnk = e.target.closest('a, button, summary, input, label, .chip');
      const live = c.classList.contains('is-live') ? ' is-live' : '';
      if (lab && lab.dataset.cursor) { c.className = 'cursor is-label' + live; lbl.textContent = lab.dataset.cursor; }
      else if (lnk) c.className = 'cursor is-link' + live;
      else c.className = 'cursor' + live;
    });
    document.addEventListener('pointerleave', () => { c.style.opacity = 0; });
    document.addEventListener('pointerenter', () => { c.style.opacity = 1; });

    /* boutons magnétiques */
    $$('.magnet').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });

    /* tilt 3D */
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .15s ease-out';
        el.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateZ(0)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .9s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
      });
    });
  }

  /* ---------- parallaxe + méthode épinglée ---------- */
  const pars = $$('[data-parallax]');
  const method = $('#methode'), track = $('#mtrack'), mprog = $('#mprog');
  const pinMQ = matchMedia('(min-width:1024px)');
  const setupPin = () => {
    if (reduce || !pinMQ.matches) { method.classList.remove('is-pinnable'); method.style.height = ''; track.style.transform = ''; return; }
    method.classList.add('is-pinnable');
    const dist = track.scrollWidth - innerWidth;
    method.style.height = (innerHeight + Math.max(0, dist)) + 'px';
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (!reduce) pars.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        el.style.transform = `translate3d(0,${(r.top * +el.dataset.parallax).toFixed(1)}px,0)`;
      });
      if (method.classList.contains('is-pinnable')) {
        const r = method.getBoundingClientRect();
        const total = method.offsetHeight - innerHeight;
        const p = Math.min(1, Math.max(0, -r.top / total));
        const dist = track.scrollWidth - innerWidth;
        track.style.transform = `translate3d(${(-dist * p).toFixed(1)}px,0,0)`;
        mprog.style.transform = `scaleX(${p})`;
      } else if (mprog) {
        const p = track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth);
        mprog.style.transform = `scaleX(${p})`;
      }
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  track.addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { setupPin(); onScroll(); });
  addEventListener('load', () => { setupPin(); onScroll(); });
  setupPin(); onScroll();

  /* ---------- vidéo ---------- */
  $$('.video').forEach((f) => {
    const v = $('video', f), b = $('.video__play', f);
    b.addEventListener('click', () => { v.controls = true; v.play(); f.classList.add('is-playing'); });
    v.addEventListener('pause', () => { if (v.ended) { f.classList.remove('is-playing'); v.controls = false; } });
  });

  /* ---------- visionneuse ---------- */
  const lb = $('#lbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  const shots = $$('#tcards .card').map((c) => ({ src: $('img', c).currentSrc || $('img', c).src, alt: $('img', c).alt, cap: $('.card__t', c).textContent }));
  let cur = 0, lastFocus = null;
  const showShot = (i) => { cur = (i + shots.length) % shots.length; const s = shots[cur]; lbImg.src = $$('#tcards .card img')[cur].currentSrc || s.src; lbImg.alt = s.alt; lbCap.textContent = s.cap; };
  const openLb = (i) => { lastFocus = document.activeElement; showShot(i); lb.hidden = false; requestAnimationFrame(() => lb.classList.add('is-open')); $('.lbox__x', lb).focus(); };
  const closeLb = () => { lb.classList.remove('is-open'); setTimeout(() => { lb.hidden = true; }, 500); lastFocus && lastFocus.focus(); };
  $$('#tcards .card').forEach((c, i) => c.addEventListener('click', () => openLb(i)));
  $('.lbox__x', lb).addEventListener('click', closeLb);
  $('.lbox__nav--p', lb).addEventListener('click', () => showShot(cur - 1));
  $('.lbox__nav--n', lb).addEventListener('click', () => showShot(cur + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showShot(cur - 1);
    if (e.key === 'ArrowRight') showShot(cur + 1);
  });

  /* ---------- avant / après ---------- */
  const ba = $('#ba');
  if (ba) {
    const r = $('.ba__range', ba);
    const set = (v) => ba.style.setProperty('--p', v + '%');
    r.addEventListener('input', () => set(r.value));
    // petite démonstration à l'apparition
    if (!reduce) {
      const demo = new IntersectionObserver((es) => {
        if (!es[0].isIntersecting) return; demo.disconnect();
        const t0 = performance.now();
        const anim = (t) => {
          const p = Math.min(1, (t - t0) / 2200);
          const v = 50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p);
          set(v.toFixed(1)); if (p < 1) requestAnimationFrame(anim); else { set(50); r.value = 50; }
        };
        requestAnimationFrame(anim);
      }, { threshold: 0.5 });
      demo.observe(ba);
    }
  }

  /* ---------- galerie : glisser à la souris ---------- */
  $$('.gal').forEach((g) => {
    let down = false, sx = 0, sl = 0, moved = false;
    g.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = g.scrollLeft; });
    addEventListener('pointerup', () => { down = false; g.classList.remove('is-drag'); });
    g.addEventListener('pointermove', (e) => {
      if (!down) return; const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; g.classList.add('is-drag'); }
      g.scrollLeft = sl - dx;
    });
    g.addEventListener('click', (e) => { if (moved) e.preventDefault(); }, true);
  });

  /* ---------- panneaux formations ---------- */
  let openDrawer = null, drawerOpener = null;
  const closeDrawer = () => {
    if (!openDrawer) return;
    openDrawer.classList.remove('is-open'); html.classList.remove('drawer-open');
    openDrawer.setAttribute('aria-hidden', 'true'); openDrawer = null;
    drawerOpener && drawerOpener.focus();
  };
  $$('.drawer').forEach((d) => d.setAttribute('aria-hidden', 'true'));
  $$('[data-drawer]').forEach((b) => b.addEventListener('click', () => {
    const d = document.getElementById(b.dataset.drawer);
    drawerOpener = b; openDrawer = d;
    d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false'); html.classList.add('drawer-open');
    setTimeout(() => $('.drawer__x', d).focus(), 350);
  }));
  $$('.drawer__x, .drawer__veil, .drawer [data-close]').forEach((b) => b.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  /* ---------- les profils : liste + portrait cerclé ----------
     Motif « onglets » : une seule entrée au clavier, puis les
     flèches circulent. L'anneau avance seul, mais se tait dès que
     le visiteur survole ou tabule dans la section — on ne déplace
     pas ce qu'il est en train de lire — et ne tourne que lorsque
     la section est à l'écran. */
  const swap = $('#swap');
  if (swap) {
    const tabs = $$('.swap__b', swap);
    const panels = $$('.swap__p', swap);
    const vues = $$('.swap__ph picture', swap);
    const badge = $('.swap__badge i', swap);
    const dwell = parseFloat(getComputedStyle(swap).getPropertyValue('--dwell')) || 5200;
    let idx = 0, minuteur = null, retenu = false, visible = false;

    const arreter = () => { swap.classList.remove('is-run'); clearTimeout(minuteur); };
    const lancer = () => {
      arreter();
      if (reduce || retenu || !visible) return;
      void swap.offsetWidth;            // force le redémarrage des animations CSS
      swap.classList.add('is-run');
      minuteur = setTimeout(() => montrer(idx + 1), dwell);
    };
    const montrer = (n, prendreFocus) => {
      idx = (n + tabs.length) % tabs.length;
      tabs.forEach((t, i) => {
        t.setAttribute('aria-selected', String(i === idx));
        t.tabIndex = i === idx ? 0 : -1;
      });
      panels.forEach((p, i) => { p.hidden = i !== idx; });
      vues.forEach((v, i) => v.classList.toggle('is-on', i === idx));
      if (badge) badge.textContent = String(idx + 1).padStart(2, '0');
      if (prendreFocus) tabs[idx].focus();
      lancer();
    };

    const retenir = (v) => { retenu = v; if (v) arreter(); else lancer(); };
    swap.addEventListener('pointerenter', () => retenir(true));
    swap.addEventListener('pointerleave', () => retenir(false));
    swap.addEventListener('focusin', () => retenir(true));
    swap.addEventListener('focusout', (e) => { if (!swap.contains(e.relatedTarget)) retenir(false); });

    tabs.forEach((t) => {
      t.addEventListener('click', () => montrer(+t.dataset.i));
      if (fine) t.addEventListener('pointerenter', () => montrer(+t.dataset.i));
    });

    $('.swap__list', swap).addEventListener('keydown', (e) => {
      const suivant = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (suivant) { e.preventDefault(); montrer(idx + suivant, true); }
      else if (e.key === 'Home') { e.preventDefault(); montrer(0, true); }
      else if (e.key === 'End') { e.preventDefault(); montrer(tabs.length - 1, true); }
    });

    new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      if (visible) lancer(); else arreter();
    }, { threshold: 0.25 }).observe(swap);

    montrer(0);
  }

  /* ---------- coordonnées (écrites par JS, non lisibles par les robots) ---------- */
  /* Forme affichée : lue telle quelle, pas reconstruite par une
     expression régulière — le nombre de chiffres varie d'un pays
     à l'autre et un motif figé finirait par ne plus correspondre. */
  const telFmt = CONFIG.tel || ('+' + CONFIG.whatsapp);
  $$('[data-coord="mail"]').forEach((el) => { el.innerHTML = `<a href="mailto:${CONFIG.email}">${CONFIG.email}</a>`; });
  $$('[data-coord="tel"]').forEach((el) => {
    if (!CONFIG.whatsapp) { const box = el.closest('div'); if (box && box.parentElement.classList.contains('coord')) box.remove(); else el.remove(); return; }
    el.innerHTML = `<a href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener noreferrer">${telFmt}</a>`;
  });
  if (!CONFIG.whatsapp) $$('[data-wa]').forEach((el) => { el.hidden = true; el.style.display = 'none'; });
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- générateur de demande ---------- */
  const form = $('#fContact');
  if (form) {
    const pv = $('#preview'), stat = $('#sendStat');
    const val = (n) => (form.elements[n] && form.elements[n].value || '').trim();
    const picked = (g) => $$(`.chips[data-group="${g}"] .chip[aria-pressed="true"]`, form).map((c) => c.dataset.v);

    /* Référence de la demande, de la forme DH-260923-K4F2.
       La date rend le tri immédiat, le suffixe aléatoire évite que
       deux demandes du même jour portent le même numéro. Engendrée
       une fois à l'ouverture de la page : le visiteur voit la même
       référence que celle qui partira. */
    const REF = (() => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, '0');
      const jour = p(d.getFullYear() % 100) + p(d.getMonth() + 1) + p(d.getDate());
      let suffixe = '';
      const lettres = 'ACDEFGHJKLMNPQRTUVWXY349';   // sans O/0, I/1, S/5, B/8 : rien d'ambigu à l'oral
      const alea = new Uint8Array(4);
      (crypto && crypto.getRandomValues) ? crypto.getRandomValues(alea) : alea.forEach((_, i) => { alea[i] = Math.random() * 256; });
      alea.forEach((n) => { suffixe += lettres[n % lettres.length]; });
      return `DH-${jour}-${suffixe}`;
    })();

    $$('.chips', form).forEach((group) => {
      group.addEventListener('click', (e) => {
        const c = e.target.closest('.chip'); if (!c) return;
        const on = c.getAttribute('aria-pressed') !== 'true';
        if (group.hasAttribute('data-single') || c.dataset.v === '__flou') $$('.chip', group).forEach((x) => x.setAttribute('aria-pressed', 'false'));
        else $$('.chip[data-v="__flou"]', group).forEach((x) => x.setAttribute('aria-pressed', 'false'));
        c.setAttribute('aria-pressed', on);
        build();
      });
    });

    const list = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + (EN ? ' and ' : ' et ') + a[a.length - 1];

    /* « de » s'élide devant une voyelle ou un h muet : les choix
       d'établissement commencent tous par « un » ou « une », d'où
       « au sujet d'un hôtel » et non « au sujet de un hôtel ». Un
       nom propre saisi librement, lui, peut commencer par n'importe
       quelle lettre — on teste donc l'initiale réelle. */
    const de = (t) => (/^[aeiouàâäéèêëîïôöûüùy]/i.test(t) ? 'd’' : 'de ') + t;

    const build = () => {
      const dom = picked('dom'), etab = picked('etab')[0];
      const nom = val('nom'), ville = val('ville'), et = val('etablissement'), eff = val('effectif'), plus = val('precision');
      const lieu = et ? (etab ? etab + ', ' + et : et) : etab;
      let m, s;

      if (EN) {
        m = 'Hello,\n\n';
        s = 'I would like to talk with you';
        if (lieu) s += ' about ' + lieu;
        if (ville) s += ', in ' + ville;
        s += '.';
        m += s;
        if (dom.includes('__flou')) m += '\nI am not yet sure exactly what we need: a diagnostic would help us.';
        else if (dom.length) m += '\nOur needs concern ' + list(dom) + '.';
        if (eff) m += '\nWe have around ' + eff + (+eff > 1 ? ' people' : ' person') + ' to train.';
        if (plus) m += '\n\n' + plus;
        m += '\n\nI would be interested in the free first observation visit.\n\nKind regards,' + (nom ? '\n' + nom : '');
      } else {
        m = 'Bonjour,\n\n';
        s = 'Je souhaite échanger avec vous';
        if (lieu) s += ' au sujet ' + de(lieu);
        if (ville) s += ', à ' + ville;
        s += '.';
        m += s;
        if (dom.includes('__flou')) m += '\nJe ne sais pas encore précisément ce dont nous avons besoin : un diagnostic nous aiderait.';
        else if (dom.length) m += '\nNotre besoin concerne ' + list(dom) + '.';
        if (eff) m += '\nNous avons environ ' + eff + ' personne' + (+eff > 1 ? 's' : '') + ' à former.';
        if (plus) m += '\n\n' + plus;
        m += '\n\nJe serais intéressé(e) par la première visite d’observation.\n\nCordialement,' + (nom ? '\n' + nom : '');
      }

      pv.textContent = m;
      const wa = $('#bWa'); if (wa && CONFIG.whatsapp) wa.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(m)}`;
      return m;
    };
    form.addEventListener('input', build); build();
    $$('.fab[data-wa], .menu [data-wa]').forEach((a) => { if (CONFIG.whatsapp) a.href = `https://wa.me/${CONFIG.whatsapp}`; });

    /* Libellés d'état, dans la langue de la page consultée. */
    const OBJET = EN ? 'Website enquiry — Dyani Hospitality'
                     : 'Demande de diagnostic — Dyani Hospitality';
    const T = EN ? {
      mail:   'Please enter a valid e-mail address so that we can reply.',
      envoi:  'Sending…',
      ok:     'Message sent. You will receive a reply within 24 hours.',
      lent:   'One moment…',
      err:    'Sending failed. Please use WhatsApp, or copy the message and e-mail it to us.',
      copie:  'Message copied.',
      copieK: 'Copy failed: select the text of the preview instead.'
    } : {
      mail:   'Indiquez une adresse e-mail valide pour que nous puissions vous répondre.',
      envoi:  'Envoi en cours…',
      ok:     'Message envoyé. Vous recevrez une réponse sous 24 heures.',
      lent:   'Un instant…',
      err:    'L’envoi a échoué. Utilisez WhatsApp, ou copiez le message et adressez-le-nous par e-mail.',
      copie:  'Message copié.',
      copieK: 'Copie impossible : sélectionnez le texte de l’aperçu.'
    };

    const say = (t, genre) => {
      stat.hidden = !t;
      stat.textContent = t || '';
      stat.className = 'sstat' + (genre ? ' sstat--' + genre : '');
    };
    $('#bCopy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(build()); say(T.copie, 'ok'); } catch (e) { say(T.copieK, 'err'); }
    });

    /* Corps de la requête : le message rédigé, plus les champs
       séparés pour que l'e-mail reçu reste lisible d'un coup d'œil.

       L'envoi se fait en FormData, et non en JSON. Ce n'est pas un
       détail : « Content-Type: application/json » obligerait le
       navigateur à une requête de vérification préalable (OPTIONS)
       que l'API de Web3Forms refuse — l'envoi échouerait toujours.
       FormData et l'en-tête « Accept » sont, eux, autorisés d'office.
       Ne pas repasser en JSON. */
    const charge = () => {
      const dom = picked('dom');
      const flou = dom.includes('__flou');
      const utiles = dom.filter((d) => d !== '__flou');
      const etab = picked('etab');
      const champs = {
        access_key: CONFIG.web3formsKey,
        /* La référence figure dans l'objet : l'e-mail est retrouvable
           d'une recherche, et une réponse conserve le fil. */
        subject: OBJET + ' — ' + REF,
        from_name: val('nom') || (EN ? 'Website form' : 'Formulaire du site'),
        email: val('email'),
        message: build(),
        'Référence': REF,
        'Nom': val('nom') || '—',
        'Établissement': val('etablissement') || '—',
        'Type': etab.length ? etab.join(', ') : '—',
        'Ville': val('ville') || '—',
        'Personnes à former': val('effectif') || '—',
        'Domaine': utiles.length ? utiles.join(', ') : (flou ? (EN ? 'to be defined together' : 'à définir ensemble') : '—'),
        'Langue de la page': EN ? 'anglais' : 'français'
      };
      const corps = new FormData();
      Object.keys(champs).forEach((k) => corps.append(k, champs[k]));
      return corps;
    };

    /* Seconde protection, en plus du champ-piège : un formulaire
       rempli et envoyé en moins de trois secondes n'a pas été rempli
       par un humain. On ne bloque pas définitivement — on refuse
       l'envoi et on invite à réessayer, pour ne jamais pénaliser un
       visiteur pressé qui aurait tout collé d'un coup. */
    const OUVERTURE = Date.now();
    const DELAI_MIN = 3000;

    let enCours = false;
    const bMail = $('#bMail');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (enCours) return;
      if (val('site')) return; // champ-piège : robot, on ne dit rien

      if (Date.now() - OUVERTURE < DELAI_MIN) {
        say(T.lent);
        setTimeout(() => { if (stat.textContent === T.lent) say(''); }, 1600);
        return;
      }

      const mail = form.elements.email;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())) {
        mail.focus();
        say(T.mail, 'err');
        return;
      }

      /* Repli tant qu'aucune clé n'est renseignée : le visiteur
         repart avec son message dans son logiciel de messagerie. */
      if (!CONFIG.web3formsKey) {
        location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(OBJET)}&body=${encodeURIComponent(build())}`;
        return;
      }

      enCours = true;
      bMail.disabled = true;
      bMail.setAttribute('aria-disabled', 'true');
      say(T.envoi);
      try {
        const r = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: charge()
        });
        const j = await r.json();
        say(j.success ? T.ok : T.err, j.success ? 'ok' : 'err');
      } catch (err) {
        say(T.err, 'err');
      } finally {
        enCours = false;
        bMail.disabled = false;
        bMail.removeAttribute('aria-disabled');
      }
    });
  }
})();
