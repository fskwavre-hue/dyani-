(function () {
  'use strict';
  var doux = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- mise en scène à l'ouverture ---------- */
  requestAnimationFrame(function(){ document.body.classList.add('loaded'); });

  /* ---------- menu mobile ----------
     Le panneau, le voile et le bouton sont pilotés par deux classes
     seulement : .open sur le panneau, .on sur le voile. Toute
     l'animation vit dans la feuille de style. On verrouille le
     défilement de la page pendant l'ouverture pour que le geste
     reste dans le panneau.
     ------------------------------------------------------------ */
  var burger = document.getElementById('burger');
  var mmenu  = document.getElementById('mmenu');
  var mveil  = document.getElementById('mveil');
  var mlinks = Array.prototype.slice.call(mmenu.querySelectorAll('.mlink'));
  var etiquettes = {
    ouvrir: burger.getAttribute('aria-label'),
    fermer: document.documentElement.lang === 'en' ? 'Close the menu' : 'Fermer le menu'
  };

  function ouvert(){ return mmenu.classList.contains('open'); }

  function bloquerPage(actif){
    var d = document.documentElement;
    d.classList.toggle('menu-ouvert', actif);
    if (actif){
      d.style.overflow = 'hidden';
      /* compense la disparition de l'ascenseur pour que l'en-tête
         ne se décale pas d'un ou deux pixels */
      var laize = window.innerWidth - d.clientWidth;
      if (laize > 0) d.style.paddingRight = laize + 'px';
    } else {
      d.style.overflow = '';
      d.style.paddingRight = '';
    }
  }

  function basculer(o){
    mmenu.classList.toggle('open', o);
    mveil.classList.toggle('on', o);
    burger.setAttribute('aria-expanded', String(o));
    burger.setAttribute('aria-label', o ? etiquettes.fermer : etiquettes.ouvrir);
    bloquerPage(o);
  }

  function fermer(retour){
    if (!ouvert()) return;
    basculer(false);
    if (retour) burger.focus();
  }

  burger.addEventListener('click', function(){
    if (ouvert()){ fermer(false); return; }
    mmenu.scrollTop = 0;
    basculer(true);
  });

  mveil.addEventListener('click', function(){ fermer(false); });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') fermer(true);
  });

  /* un appui hors de l'en-tête ferme aussi : le voile ne couvre pas
     la bande supérieure, où le logo reste cliquable */
  document.addEventListener('pointerdown', function(e){
    if (!ouvert()) return;
    if (mmenu.contains(e.target) || burger.contains(e.target)) return;
    fermer(false);
  });

  /* de retour en pleine largeur, la barre reprend la main */
  window.addEventListener('resize', function(){
    if (ouvert() && window.innerWidth > 1150) fermer(false);
  });

  /* ---------- navigation interne ---------- */
  function hauteurEntete(){ return document.getElementById('header').offsetHeight; }
  function aller(id){
    if (id === 'top'){ window.scrollTo({ top: 0, behavior: doux ? 'smooth' : 'auto' }); return; }
    var c = document.getElementById(id);
    if (!c) return;
    var y = c.getBoundingClientRect().top + window.pageYOffset - hauteurEntete() - 22;
    window.scrollTo({ top: Math.max(y, 0), behavior: doux ? 'smooth' : 'auto' });
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-go]');
    if (!b) return;
    fermer(); aller(b.dataset.go);
  });

  /* ---------- barre de progression, en-tête, dock ---------- */
  var prog = document.getElementById('prog');
  var header = document.getElementById('header');
  var dock = document.getElementById('dock');
  var hautContact = 0;
  function mesurer(){ hautContact = document.getElementById('contact').getBoundingClientRect().top + window.pageYOffset; }
  mesurer(); window.addEventListener('resize', mesurer);

  var tick = false;
  function surScroll(){
    var y = window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    header.classList.toggle('stuck', y > 14);
    dock.classList.toggle('show', y > window.innerHeight * 0.8 && y < hautContact - 400);
    tick = false;
  }
  window.addEventListener('scroll', function(){
    if (!tick){ tick = true; requestAnimationFrame(surScroll); }
  }, { passive: true });
  surScroll();

  /* ---------- révélations au défilement ----------
     Chaque section a sa direction propre : montée, entrée latérale
     ou dévoilement d'image. Le décalage entre éléments voisins
     donne la sensation de mise en place progressive.            */
  var cibles = document.querySelectorAll('[data-rv]');

  if (!doux || !('IntersectionObserver' in window)){
    cibles.forEach(function(el){ el.classList.add('is-in'); });
  } else {
    var vus = new WeakSet();
    var io = new IntersectionObserver(function(entrees){
      entrees.forEach(function(en){
        if (!en.isIntersecting || vus.has(en.target)) return;
        vus.add(en.target);
        var d = Number(en.target.dataset.d || 0);
        setTimeout(function(){ en.target.classList.add('is-in'); }, d);
        io.unobserve(en.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -10% 0px' });

    /* décalage automatique entre éléments frères d'un même groupe */
    ['.marks__g','.dom','.refs','.prof','.chain'].forEach(function(sel){
      var g = document.querySelector(sel);
      if (!g) return;
      Array.prototype.forEach.call(g.children, function(el, i){
        if (el.hasAttribute('data-rv')) el.dataset.d = i * 110;
      });
    });

    cibles.forEach(function(el){ io.observe(el); });
  }

  /* ---------- formations : dépliage du détail complet ----------
     Le panneau est ouvert dans le HTML pour rester lisible sans
     JavaScript ; on le replie ici, au chargement.               */
  document.querySelectorAll('.fold__b').forEach(function(b){
    var pan = document.getElementById(b.getAttribute('aria-controls'));
    if (!pan) return;
    var lbl = b.querySelector('.fold__lbl');

    var poser = function(ouvert){
      b.setAttribute('aria-expanded', String(ouvert));
      pan.classList.toggle('open', ouvert);
      if (lbl) lbl.textContent = ouvert ? b.dataset.close : b.dataset.open;
    };

    poser(false);                    /* replié à l'arrivée */
    b.addEventListener('click', function(){
      poser(b.getAttribute('aria-expanded') !== 'true');
    });
  });

  /* ---------- formations : accordéon ---------- */
  document.querySelectorAll('.fam__h').forEach(function(h){
    h.addEventListener('click', function(){
      var pan = document.getElementById(h.getAttribute('aria-controls'));
      var ouvert = h.getAttribute('aria-expanded') === 'true';
      h.setAttribute('aria-expanded', String(!ouvert));
      pan.classList.toggle('open', !ouvert);
      /* les lignes du panneau arrivent en cascade */
      if (!ouvert){
        pan.querySelectorAll('.prog').forEach(function(p, i){
          p.style.transitionDelay = (90 + i * 70) + 'ms';
        });
      } else {
        pan.querySelectorAll('.prog').forEach(function(p){ p.style.transitionDelay = '0ms'; });
      }
    });
  });

  /* ---------- barre de navigation : indicateur glissant ----------
     L'indicateur suit le lien survolé, et revient au lien actif
     quand la souris quitte la barre. Mesuré à chaque fois : aucune
     position n'est écrite en dur, la barre reste juste si les
     libellés changent ou si la langue change la largeur des mots. */
  var pill = document.querySelector('.nav__pill');
  if (pill){
    var ind = pill.querySelector('.nav__ind');
    var lks = Array.prototype.slice.call(pill.querySelectorAll('.navlink'));

    function poser(el){
      /* Un seul lien porte .lit : celui que la pastille recouvre.
         Sans cela, le libellé survolé reste sombre sur fond sombre. */
      lks.forEach(function(l){ l.classList.toggle('lit', l === el); });
      if (!el){ ind.classList.remove('on'); return; }
      ind.style.width = el.offsetWidth + 'px';
      ind.style.transform = 'translateX(' + el.offsetLeft + 'px)';
      ind.classList.add('on');
    }
    function actif(){ return pill.querySelector('.navlink.active'); }

    lks.forEach(function(l){
      l.addEventListener('mouseenter', function(){ poser(l); });
      l.addEventListener('focus', function(){ poser(l); });
    });
    pill.addEventListener('mouseleave', function(){ poser(actif()); });

    /* Le lien actif est posé par l'observateur de sections : on le suit.
       Garde-fou : poser() écrit sur l'indicateur, qui est lui-même dans
       le sous-arbre observé. Sans filtre, l'observateur se rappellerait
       lui-même sans fin. On ignore donc toute mutation issue de
       l'indicateur, et on n'agit que si la cible a réellement changé. */
    var dernier = null;
    new MutationObserver(function(recs){
      var pertinent = false;
      for (var i = 0; i < recs.length; i++){
        if (recs[i].target !== ind){ pertinent = true; break; }
      }
      if (!pertinent || pill.matches(':hover')) return;
      var a = actif();
      if (a === dernier) return;
      dernier = a;
      poser(a);
    }).observe(pill, { subtree:true, attributes:true, attributeFilter:['class'] });

    var mrz;
    window.addEventListener('resize', function(){
      clearTimeout(mrz); mrz = setTimeout(function(){ poser(actif()); }, 140);
    });

    /* les polices changent la largeur des libellés : on repose après chargement */
    if (document.fonts && document.fonts.ready){
      document.fonts.ready.then(function(){ poser(actif()); });
    }
    poser(actif());
  }

  /* ---------- profils : rangée glissante sur téléphone ----------
     Les petits ronds suivent la carte visible. La rangée ne devient
     atteignable au clavier que lorsqu'elle défile réellement. */
  var profL = document.querySelector('.prof');
  if (profL){
    var profDots = Array.prototype.slice.call(document.querySelectorAll('.prof__dots i'));
    var profIt = profL.children;
    var profAtt = false;

    function majProf(){
      var defile = profL.scrollWidth > profL.clientWidth + 2;
      if (defile) profL.setAttribute('tabindex', '0');
      else profL.removeAttribute('tabindex');
      if (!defile || profIt.length < 2) return;
      var pasP = profIt[1].offsetLeft - profIt[0].offsetLeft;
      var fin = profL.scrollLeft >= profL.scrollWidth - profL.clientWidth - 2;
      var k = fin ? profIt.length - 1 : Math.round(profL.scrollLeft / pasP);
      profDots.forEach(function(d, n){ d.classList.toggle('on', n === k); });
    }

    profL.addEventListener('scroll', function(){
      if (!profAtt){ profAtt = true; requestAnimationFrame(function(){ majProf(); profAtt = false; }); }
    }, { passive: true });
    window.addEventListener('resize', majProf);
    majProf();
  }

  /* ---------- lien de navigation actif ---------- */
  var liens = Array.prototype.slice.call(document.querySelectorAll('#navlinks .navlink'));
  var sections = liens.map(function(b){ return document.getElementById(b.dataset.go); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length){
    var spy = new IntersectionObserver(function(entrees){
      entrees.forEach(function(en){
        if (!en.isIntersecting) return;
        liens.forEach(function(b){ b.classList.toggle('active', b.dataset.go === en.target.id); });
        mlinks.forEach(function(b){ b.classList.toggle('active', b.dataset.go === en.target.id); });
      });
    }, { rootMargin: '-46% 0px -50% 0px' });
    sections.forEach(function(s){ spy.observe(s); });
  }

  /* ============================================================
     CONTACT — PROTECTION CONTRE LES ROBOTS COLLECTEURS
     Les coordonnées ne figurent nulle part en clair : ni dans le
     HTML, ni dans ce fichier. Elles sont encodées en base64 et
     reconstituées par le navigateur au moment de l'affichage.
     Un aspirateur d'adresses qui lit la source ne trouve rien.

     POUR MODIFIER UNE COORDONNÉE
     Ouvrir la console du navigateur et exécuter :
         btoa('nouvelle-valeur')
     puis coller le résultat ci-dessous.
       _e -> adresse e-mail
       _w -> numéro WhatsApp, format international sans + ni espace
       _t -> numéro affiché, lisible
     ============================================================ */
  /* Langue de la page consultée. L'objet de l'e-mail, les
     libellés d'état et le message composé en découlent. */
  var EN = document.documentElement.lang === 'en';

  var _c = {
    _e: 'Y29udGFjdEBkeWFuaWhvc3BpdGFsaXR5LmNvbQ==',
    _w: 'MzI0ODQ2NTAzNTM=',
    _t: 'KzMyIDQ4NCA2NSAwMyA1Mw=='
  };
  function _d(s){ try { return decodeURIComponent(escape(window.atob(s))); } catch (e) { return ''; } }

  var CONTACT = {
    get email(){ return _d(_c._e); },
    get whatsapp(){ return _d(_c._w); },
    get tel(){ return _d(_c._t); },
    objet: EN ? 'Website enquiry — Dyani Hospitality'
              : 'Demande de diagnostic — Dyani Hospitality'
  };

  /* ============================================================
     ENVOI DU FORMULAIRE — WEB3FORMS
     Le message composé est déposé sur api.web3forms.com, qui le
     relaie vers la boîte e-mail rattachée à la clé ci-dessous.
     Le visiteur ne quitte pas la page et n'a besoin d'aucun
     logiciel de messagerie.

     POUR CHANGER DE BOÎTE DE RÉCEPTION
       1. créer un accès sur web3forms.com avec l'adresse voulue
          (plus tard : contact@dyanihospitality.com) ;
       2. coller la clé reçue (« Access Key ») dans W3F.cle.
     Cette clé est publique par nature : elle n'autorise que le
     dépôt d'un message, jamais la lecture de la boîte.

     Tant que W3F.cle reste vide, le bouton retombe sur l'ancien
     comportement (ouverture du logiciel de messagerie) : le site
     reste donc fonctionnel même sans clé.
     ============================================================ */
  var W3F = {
    cle: 'c2899e1d-f84a-48d1-9825-bbd1d207f7ec',
    url: 'https://api.web3forms.com/submit'
  };

  /* Libellés d'état, dans la langue de la page consultée. */
  var W3F_T = EN ? {
    mail:  'Please enter your e-mail address so that we can reply to you.',
    envoi: 'Sending…',
    ok:    'Message sent. You will receive a reply within 24 hours.',
    lent:  'One moment…',
    err:   'Sending failed. Please use WhatsApp, or copy the message and e-mail it to us.'
  } : {
    mail:  'Indiquez votre adresse e-mail pour que nous puissions vous répondre.',
    envoi: 'Envoi en cours…',
    ok:    'Message envoyé. Vous recevrez une réponse sous 24 heures.',
    lent:  'Un instant…',
    err:   'L’envoi a échoué. Utilisez WhatsApp, ou copiez le message et adressez-le-nous par e-mail.'
  };

  /* Écriture des coordonnées dans la page, après chargement.
     data-coord="mail" | "tel" ; data-coord-link pour un lien actif. */
  function poserCoordonnees(){
    document.querySelectorAll('[data-coord]').forEach(function(el){
      var t = el.dataset.coord;
      var txt = t === 'mail' ? CONTACT.email : CONTACT.tel;
      if (!txt) return;
      if (el.hasAttribute('data-coord-link')){
        var a = document.createElement('a');
        a.className = 'coord__a';
        a.textContent = txt;
        a.rel = 'noopener';
        a.href = t === 'mail'
          ? 'mailto:' + CONTACT.email
          : 'https://wa.me/' + CONTACT.whatsapp;
        if (t !== 'mail'){ a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        el.textContent = ''; el.appendChild(a);
      } else {
        el.textContent = txt;
      }
    });
  }
  poserCoordonnees();

  /* ============================================================
     FILTRE ANTI-ROBOT DU FORMULAIRE
     Deux contrôles, invisibles pour un visiteur humain :
       1. champ-piège (honeypot) — masqué en CSS, jamais présenté
          à l'utilisateur ; un robot le remplit, un humain non ;
       2. délai minimal — un envoi déclenché moins de 3 secondes
          après le chargement provient d'un script, pas d'une
          personne qui a lu la page.
     ============================================================ */
  var OUVERTURE = Date.now();
  var DELAI_MIN = 3000;

  function portePassee(){
    var piege = document.getElementById('hp-site');
    if (piege && piege.value !== ''){ return false; }
    if (Date.now() - OUVERTURE < DELAI_MIN){
      etat(W3F_T.lent, '');
      setTimeout(function(){
        if (zoneEtat && zoneEtat.textContent === W3F_T.lent) etat('');
      }, 1600);
      return false;
    }
    return true;
  }


  var apercu = document.getElementById('preview');
  var bMail  = document.getElementById('bMail');
  var bWa    = document.getElementById('bWa');
  var bCopy  = document.getElementById('bCopy');
  var cDom   = document.getElementById('cDom');
  var cEtab  = document.getElementById('cEtab');

  function choisis(g){
    return Array.prototype.slice.call(g.querySelectorAll('.chip[aria-pressed="true"]'))
      .map(function(c){ return c.dataset.v; });
  }
  /* Plusieurs libellés de pastilles contiennent déjà « et »
     (« le service et l'expérience client »). Les enchaîner avec un
     « et » supplémentaire donnerait « A et B et C et D », illisible :
     on bascule alors sur « ainsi que » pour le dernier terme. */
  function enumere(a){
    if (a.length === 1) return a[0];
    var deja = a.some(function(x){ return / (et|and) /.test(x); });
    var fin = EN ? (deja ? ' as well as ' : ' and ')
                 : (deja ? ' ainsi que ' : ' et ');
    return a.slice(0, -1).join(', ') + fin + a[a.length - 1];
  }
  function val(id){ return document.getElementById(id).value.trim(); }

  /* « au sujet de un hôtel » -> « au sujet d\u2019un hôtel ». */
  function elision(t){
    return /^[aeiouéèêh]/i.test(t) ? 'd\u2019' + t : 'de ' + t;
  }

  function ouverture(etab, nomet, ville){
    var t;
    if (EN){
      t = 'I am writing to you about ';
      t += etab.length ? enumere(etab) : (nomet ? 'our establishment' : 'our teams');
      if (nomet) t += ', ' + nomet;
      if (ville) t += (nomet ? ', ' : ' ') + 'in ' + ville;
    } else {
      t = 'Je vous écris au sujet ';
      /* L'élision porte sur chaque terme, sans quoi une sélection
         multiple donnerait « au sujet d'un hôtel et un riad ». */
      t += etab.length ? enumere(etab.map(elision))
                       : (nomet ? 'de notre établissement' : 'de nos équipes');
      if (nomet) t += ', ' + nomet;
      if (ville) t += (nomet ? ', ' : ' ') + 'à ' + ville;
    }
    return t + '.';
  }

  /* Le message est rédigé dans la langue de la page : un visiteur
     de la version anglaise n'envoie pas un texte français. */
  function composer(){
    var l = [EN ? 'Hello,' : 'Bonjour,'];
    var dom = choisis(cDom);
    var flou = dom.indexOf('__flou') > -1;
    dom = dom.filter(function(d){ return d !== '__flou'; });

    var etab = choisis(cEtab);
    var nomet = val('b-nomet'), ville = val('b-ville'), eff = val('b-eff');
    var nom = val('b-nom'), mail = val('b-mail'), plus = val('b-plus');

    l.push(ouverture(etab, nomet, ville));

    if (dom.length){
      l.push((EN ? 'We would like to work on ' : 'Nous souhaitons travailler sur ')
             + enumere(dom) + '.');
    } else if (flou){
      l.push(EN ? 'We are not sure yet where to start and would like to discuss it with you.'
                : 'Nous ne savons pas encore précisément par où commencer et souhaitons en discuter avec vous.');
    }

    if (eff){
      l.push(EN ? 'This would involve ' + eff + ' ' + (Number(eff) > 1 ? 'people' : 'person') + '.'
                : 'Cela concernerait ' + eff + ' personne' + (Number(eff) > 1 ? 's' : '') + '.');
    }
    if (plus) l.push(plus);

    l.push(EN ? 'Would it be possible to arrange an initial observation visit?'
              : 'Serait-il possible d\u2019organiser une première visite d\u2019observation ?');

    var fin = EN ? 'Thank you in advance.' : 'Merci d\u2019avance.';
    if (nom) fin += '\n' + nom;
    if (mail) fin += '\n' + mail;
    l.push(fin);

    return l.join('\n\n');
  }

  function rafraichir(){
    var m = composer();
    apercu.textContent = m;
  }

  /* Les liens d'envoi restent inertes tant que l'utilisateur n'a pas
     cliqué. Aucune URL exploitable n'existe dans le DOM au repos :
     un robot qui lit la page n'y trouve ni adresse ni numéro. */
  function destination(bouton){
    var m = composer(), enc = encodeURIComponent(m);
    if (bouton === bMail){
      return 'mailto:' + CONTACT.email +
             '?subject=' + encodeURIComponent(CONTACT.objet) + '&body=' + enc;
    }
    return CONTACT.whatsapp ? 'https://wa.me/' + CONTACT.whatsapp + '?text=' + enc : '';
  }

  /* WhatsApp : ouverture de la conversation, message pré-rédigé. */
  bWa.addEventListener('click', function(e){
    e.preventDefault();
    if (!portePassee()) return;
    var url = destination(bWa);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  });

  /* ---------- Envoi par e-mail via Web3Forms ---------- */
  var fContact = document.getElementById('fContact');
  var zoneEtat = document.getElementById('sendStat');
  var enCours  = false;

  function etat(txt, genre){
    if (!zoneEtat) return;
    zoneEtat.textContent = txt || '';
    zoneEtat.className = 'sstat' + (genre ? ' sstat--' + genre : '');
    zoneEtat.hidden = !txt;
  }

  /* Corps de la requête : le message rédigé, plus les champs
     séparés pour que l'e-mail reçu reste lisible d'un coup d'œil.

     L'envoi se fait en FormData, et non en JSON. Ce n'est pas un
     détail : « Content-Type: application/json » obligerait le
     navigateur à une requête de vérification préalable (OPTIONS)
     que l'API de Web3Forms refuse — l'envoi échouerait toujours.
     FormData et l'en-tête « Accept » sont, eux, autorisés d'office.
     Ne pas repasser en JSON. */
  function charge(){
    var dom  = choisis(cDom);
    var flou = dom.indexOf('__flou') > -1;
    dom = dom.filter(function(d){ return d !== '__flou'; });
    var etab = choisis(cEtab);

    var champs = {
      access_key: W3F.cle,
      subject: CONTACT.objet,
      from_name: val('b-nom') || 'Formulaire du site',
      email: val('b-mail'),
      message: composer(),
      'Nom': val('b-nom') || '—',
      'Établissement': val('b-nomet') || '—',
      'Type': etab.length ? etab.join(', ') : '—',
      'Ville': val('b-ville') || '—',
      'Personnes à former': val('b-eff') || '—',
      'Domaine': dom.length ? dom.join(', ') : (flou ? 'à définir ensemble' : '—'),
      'Langue de la page': EN ? 'anglais' : 'français'
    };

    var corps = new FormData();
    Object.keys(champs).forEach(function(k){ corps.append(k, champs[k]); });
    return corps;
  }

  function remiseAZero(){
    ['b-nom','b-ville','b-nomet','b-eff','b-mail','b-plus'].forEach(function(id){
      document.getElementById(id).value = '';
    });
    [cDom, cEtab].forEach(function(g){
      g.querySelectorAll('.chip').forEach(function(c){ c.setAttribute('aria-pressed','false'); });
    });
    rafraichir();
  }

  function verrou(on){
    bMail.disabled = on;
    if (on) bMail.setAttribute('aria-disabled', 'true');
    else    bMail.removeAttribute('aria-disabled');
  }

  if (fContact) fContact.addEventListener('submit', function(e){
    e.preventDefault();
    if (enCours) return;
    if (!portePassee()) return;

    /* Repli tant qu'aucune clé n'est renseignée : ancien comportement. */
    if (!W3F.cle){ window.location.href = destination(bMail); return; }

    var mail = val('b-mail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)){
      etat(W3F_T.mail, 'err');
      document.getElementById('b-mail').focus();
      return;
    }

    enCours = true;
    verrou(true);
    etat(W3F_T.envoi, '');

    fetch(W3F.url, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: charge()
    })
    .then(function(r){
      return r.json().catch(function(){ return {}; }).then(function(d){
        if (!r.ok || d.success === false) throw new Error(d.message || 'refus');
        return d;
      });
    })
    .then(function(){
      etat(W3F_T.ok, 'ok');
      remiseAZero();
    })
    .catch(function(){
      etat(W3F_T.err, 'err');
    })
    .then(function(){
      enCours = false;
      verrou(false);
    });
  });

  [cDom, cEtab].forEach(function(g){
    g.addEventListener('click', function(e){
      var c = e.target.closest('.chip');
      if (!c) return;
      var on = c.getAttribute('aria-pressed') === 'true';
      c.setAttribute('aria-pressed', String(!on));
      if (g === cDom){
        var estFlou = c.dataset.v === '__flou';
        g.querySelectorAll('.chip').forEach(function(o){
          if (o === c) return;
          var autre = o.dataset.v === '__flou';
          if (!on && (estFlou ? !autre : autre)) o.setAttribute('aria-pressed','false');
        });
      }
      rafraichir();
    });
  });

  ['b-nom','b-ville','b-nomet','b-eff','b-mail','b-plus'].forEach(function(id){
    document.getElementById(id).addEventListener('input', rafraichir);
  });

  function copier(txt, btn){
    var lab = btn.dataset.lab || btn.textContent;
    btn.dataset.lab = lab;
    var fini = function(){
      btn.textContent = 'Copié'; btn.classList.add('done');
      setTimeout(function(){ btn.textContent = lab; btn.classList.remove('done'); }, 1900);
    };
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(fini, fini);
    } else {
      var t = document.createElement('textarea');
      t.value = txt; t.setAttribute('readonly','');
      t.style.position = 'absolute'; t.style.left = '-9999px';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(t); fini();
    }
  }
  bCopy.addEventListener('click', function(){ copier(composer(), bCopy); });

  /* Les domaines d'intervention mènent au formulaire, pré-remplis.
     Le rapprochement se fait par position : les quatre cartes suivent
     l'ordre des quatre premières pastilles, dans les deux langues. */
  document.querySelectorAll('.dom__c').forEach(function(c, i){
    c.style.cursor = 'pointer';
    c.setAttribute('tabindex','0');
    c.setAttribute('role','button');
    var ouvrir = function(){
      var chip = cDom.querySelectorAll('.chip')[i];
      if (chip && chip.dataset.v !== '__flou') chip.setAttribute('aria-pressed','true');
      rafraichir();
      aller('contact');
      setTimeout(function(){ document.getElementById('b-nom').focus({ preventScroll: true }); }, 700);
    };
    c.addEventListener('click', ouvrir);
    c.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); ouvrir(); }
    });
  });

  rafraichir();
})();
/* ============================================================
   MODULE — SUR LE TERRAIN
   Lecteur vidéo, visionneuse plein écran, parallaxe, langue.
   ============================================================ */
(function () {
  'use strict';
  var doux = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     1. LECTEUR VIDÉO
     La vidéo ne se charge qu'au clic : la page reste légère
     pour le visiteur qui ne la regardera pas.
     ---------------------------------------------------------- */
  var vf = document.querySelector('.vframe');
  if (vf) {
    var vid = vf.querySelector('video');
    var ov  = vf.querySelector('.vframe__ov');

    ov.addEventListener('click', function () {
      if (vid.paused) {
        vid.play();
        vf.classList.add('is-playing');
        vid.setAttribute('controls', '');
      }
    });

    vid.addEventListener('pause', function () {
      if (!vid.ended) return;
      vf.classList.remove('is-playing');
      vid.removeAttribute('controls');
    });
    vid.addEventListener('ended', function () {
      vf.classList.remove('is-playing');
      vid.removeAttribute('controls');
      vid.currentTime = 0;
    });

    /* une vidéo qui sort du champ se met en pause d'elle-même */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting && !vid.paused) vid.pause();
      }, { threshold: 0.2 }).observe(vf);
    }
  }


  /* ----------------------------------------------------------
     2. VISIONNEUSE PLEIN ÉCRAN
     ---------------------------------------------------------- */
  var lb = document.getElementById('lbox');

  if (lb) {
    var lbImg  = lb.querySelector('img');
    var lbCap  = lb.querySelector('.lbox__cap');
    var lbX    = lb.querySelector('.lbox__x');
    var lbPrev = lb.querySelector('.lbox__nav--p');
    var lbNext = lb.querySelector('.lbox__nav--n');

    /* La série ouverte. Les flèches ne circulent qu'à l'intérieur
       d'une série : on ne passe pas du terrain à l'étude de cas. */
    var serie = [], idx = 0, avant = null;

    /* Deux formes de légende coexistent : les cartes du terrain
       portent un titre et une description, les vues de l'étude de
       cas une simple <figcaption>. À défaut, l'alternative textuelle
       de l'image fait la légende. */
    function legende(el) {
      var t = el.querySelector('.tcard__t');
      if (t) {
        var d = el.querySelector('.tcard__d');
        return '<b>' + t.textContent + '</b>' + (d ? d.textContent : '');
      }
      var f = el.querySelector('figcaption');
      if (f) return f.textContent.trim();
      var im = el.querySelector('img');
      return im ? im.alt : '';
    }

    function montrer(i) {
      if (!serie.length) return;
      idx = (i + serie.length) % serie.length;
      var c = serie[idx];
      var im = c.querySelector('img');
      lbImg.src = im.currentSrc || im.src;
      lbImg.alt = im.alt;
      lbCap.innerHTML = legende(c);
      var seul = serie.length < 2;
      lbPrev.hidden = seul;
      lbNext.hidden = seul;
    }
    function ouvrir(els, i) {
      serie = els;
      avant = document.activeElement;
      montrer(i);
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lbox-on');
      lbX.focus();
    }
    function fermerLb() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lbox-on');
      if (avant) avant.focus();
    }

    /* Rend une série ouvrable, à la souris comme au clavier. */
    function brancher(selecteur, etiquette) {
      var els = Array.prototype.slice.call(document.querySelectorAll(selecteur));
      els.forEach(function (el, i) {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', etiquette);
        el.addEventListener('click', function () { ouvrir(els, i); });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrir(els, i); }
        });
      });
      return els.length;
    }

    brancher('.tcard', 'Agrandir la photographie');
    brancher('#constantin figure, #constantin .cas__ep', 'Agrandir la photographie');

    lbX.addEventListener('click', fermerLb);
    lbPrev.addEventListener('click', function () { montrer(idx - 1); });
    lbNext.addEventListener('click', function () { montrer(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) fermerLb(); });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')     { fermerLb(); }
      if (e.key === 'ArrowLeft')  { montrer(idx - 1); }
      if (e.key === 'ArrowRight') { montrer(idx + 1); }
      /* le focus reste enfermé dans la visionneuse */
      if (e.key === 'Tab') {
        var f = Array.prototype.filter.call(lb.querySelectorAll('button'),
                                            function (b) { return !b.hidden; });
        var p = f[0], d = f[f.length - 1];
        if (e.shiftKey && document.activeElement === p) { e.preventDefault(); d.focus(); }
        else if (!e.shiftKey && document.activeElement === d) { e.preventDefault(); p.focus(); }
      }
    });
  }

  /* ----------------------------------------------------------
     3. PARALLAXE
     Déplacement vertical léger, proportionnel à la position de
     l'élément dans la fenêtre. Amplitude donnée par data-par.
     ---------------------------------------------------------- */
  var paras = Array.prototype.slice.call(document.querySelectorAll('[data-par]'));
  if (doux && paras.length && window.innerWidth > 780) {
    var att = false;
    function bouger() {
      var h = window.innerHeight;
      paras.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > h + 80) return;
        var centre = r.top + r.height / 2;
        var p = (centre - h / 2) / h;                 /* -1 … 1 */
        var amp = parseFloat(el.dataset.par) || 18;
        el.style.setProperty('--py', (p * amp).toFixed(1) + 'px');
      });
      att = false;
    }
    window.addEventListener('scroll', function () {
      if (!att) { att = true; requestAnimationFrame(bouger); }
    }, { passive: true });
    window.addEventListener('resize', bouger);
    bouger();
  }


  /* ----------------------------------------------------------
     4. LANGUE
     La préférence est mémorisée localement, puis proposée si
     elle diffère de la page ouverte. Aucune redirection forcée :
     le visiteur garde la main.
     ---------------------------------------------------------- */
  var sw = document.querySelector('.lang-sw');
  if (sw) {
    sw.addEventListener('click', function (e) {
      var a = e.target.closest('a[hreflang]');
      if (!a) return;
      try { localStorage.setItem('dyani-lang', a.getAttribute('hreflang')); } catch (err) {}
    });
  }
})();
