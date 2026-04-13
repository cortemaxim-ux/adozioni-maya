/* =====================================================
   PENSIONE MAYA - Funzioni JavaScript
   
   COME MODIFICARE:
   - Numero WhatsApp: cerca WA_NUMBER qui sotto
   - FAQ: aggiungi item nell'HTML, funziona automaticamente
   - Cani: modifica cani.json, non toccare questo file
   ===================================================== */

/* ── CONFIGURAZIONE ── */
var WA_NUMBER = "393519258553";
var WA_DEFAULT = "Ciao! Ho visto il sito Border Collie Cerca Casa e vorrei informazioni.";

/* ── NAVIGAZIONE PAGINE ── */
var currentPage = 'home';

function showPage(name) {
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove('active');
  }
  var target = document.getElementById('page-' + name);
  if (target) {
    target.classList.add('active');
    currentPage = name;
  }
  try { window.scrollTo(0, 0); } catch(e) {}
  var nav = document.getElementById('mainNav');
  if (nav) nav.classList.remove('open');
}

function goContatti() {
  showPage('home');
  setTimeout(function() {
    var el = document.getElementById('contatti');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 300);
}

/* ── MENU MOBILE ── */
function toggleMenu() {
  var nav = document.getElementById('mainNav');
  if (nav) nav.classList.toggle('open');
}

/* ── FAQ ACCORDION ── */
function toggleFaq(el) {
  var item = el.parentElement;
  var wasOpen = item.classList.contains('open');
  var allItems = document.querySelectorAll('.faq-item');
  for (var i = 0; i < allItems.length; i++) {
    allItems[i].classList.remove('open');
  }
  if (!wasOpen) item.classList.add('open');
}

/* ── GALLERIA FILTRO ── */
function filterGallery(status, btn) {
  var buttons = document.querySelectorAll('.tab-btn');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('active');
  }
  if (btn) btn.classList.add('active');
  var cards = document.querySelectorAll('.gallery-card');
  for (var j = 0; j < cards.length; j++) {
    if (status === 'tutti' || cards[j].dataset.status === status) {
      cards[j].style.display = '';
    } else {
      cards[j].style.display = 'none';
    }
  }
}

/* ── MODAL CANE ── */
function openDog(id) {
  if (!window.CANI_DATA) return;
  var cane = null;
  var tutti = window.CANI_DATA.disponibili || [];
  for (var i = 0; i < tutti.length; i++) {
    if (tutti[i].id === id) { cane = tutti[i]; break; }
  }
  if (!cane) return;

  var tags = '';
  if (cane.tags) {
    for (var t = 0; t < cane.tags.length; t++) {
      tags += '<span class="tag-chip">' + cane.tags[t] + '</span>';
    }
  }

  var pedigreeInfo = cane.pedigree ? '<span style="color:#22c55e;font-weight:700;">Pedigree ENCI</span>' : '';
  var genitoriInfo = cane.genitori_visibili ? ' &middot; <span style="color:#4a90d9;">Genitori visibili</span>' : '';
  var waLink = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(cane.wa_testo || WA_DEFAULT);

  var content = '';
  content += '<img src="' + cane.foto + '" style="width:100%;height:auto;max-height:260px;object-fit:contain;border-radius:10px;margin-bottom:1.2rem;background:#f0f4f9;display:block;" alt="' + cane.nome + '">';
  content += '<h3 style="font-family:var(--font-titoli);font-size:1.8rem;color:var(--navy);margin-bottom:0.3rem;">' + cane.nome + '</h3>';
  content += '<p style="color:var(--gray);font-size:0.9rem;margin-bottom:0.4rem;">' + cane.eta + ' &middot; ' + cane.sesso + ' &middot; ' + cane.mantello + '</p>';
  content += '<p style="font-size:0.85rem;margin-bottom:1rem;">' + pedigreeInfo + genitoriInfo + '</p>';
  content += '<div class="dog-tags" style="margin-bottom:1rem;">' + tags + '</div>';
  content += '<p style="color:var(--text);line-height:1.7;font-size:0.93rem;margin-bottom:1.5rem;">' + cane.descrizione + '</p>';
  content += '<a href="' + waLink + '" target="_blank" class="btn-blue" style="text-decoration:none;display:block;text-align:center;">Sono interessato a ' + cane.nome + ' - WhatsApp</a>';

  var modalContent = document.getElementById('dogModalContent');
  if (modalContent) modalContent.innerHTML = content;

  var modal = document.getElementById('dogModal');
  if (modal) modal.classList.add('open');
}

function closeDog() {
  var modal = document.getElementById('dogModal');
  if (modal) modal.classList.remove('open');
}

/* ── FORM CONTATTI ── */
function handleForm(e) {
  e.preventDefault();
  var form = e.target;
  form.innerHTML = '<div style="text-align:center;padding:2rem;color:white;">' +
    '<div style="font-size:3rem;margin-bottom:1rem;">&#10003;</div>' +
    '<h3 style="margin-bottom:0.5rem;font-family:var(--font-titoli);">Messaggio inviato!</h3>' +
    '<p style="color:rgba(255,255,255,0.7)">Ti risponderemo entro poche ore.</p><br>' +
    '<a href="https://wa.me/' + WA_NUMBER + '" target="_blank" class="btn-primary">WhatsApp per risposta rapida</a>' +
    '</div>';
}

/* ── CARICA CANI DAL JSON ── */
function caricaCani() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'cani.json', true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        window.CANI_DATA = data;
        renderGalleria(data);
        renderDisponibili(data);
        renderAdottati(data);
      } catch(e) {
        console.warn('Errore parsing cani.json:', e);
      }
    }
  };
  xhr.onerror = function() {
    console.warn('cani.json non trovato, uso dati statici');
  };
  xhr.send();
}

/* ── RENDER GALLERIA CANI ── */
function renderGalleria(data) {
  var grid = document.getElementById('galleryGrid');
  if (!grid) return;
  var html = '';

  var disponibili = data.disponibili || [];
  for (var i = 0; i < disponibili.length; i++) {
    var c = disponibili[i];
    html += '<div class="gallery-card" data-status="disponibile" onclick="openDog(\'' + c.id + '\')">';
    html += '<div class="gallery-img"><img src="' + c.foto + '" alt="' + c.nome + '" loading="lazy"></div>';
    html += '<div class="gallery-info"><h4>' + c.nome + ' <span class="badge-disponibile">Disponibile</span></h4>';
    html += '<p>' + c.sesso + ' &middot; ' + c.mantello + (c.pedigree ? ' &middot; Pedigree' : '') + '</p></div>';
    html += '</div>';
  }

  var adottati = data.adottati || [];
  for (var j = 0; j < adottati.length; j++) {
    var a = adottati[j];
    var fotoSrc = a.foto ? a.foto : '';
    html += '<div class="gallery-card" data-status="adottato" style="opacity:0.65;">';
    if (fotoSrc) {
      html += '<div class="gallery-img"><img src="' + fotoSrc + '" alt="' + a.nome + '" loading="lazy"></div>';
    } else {
      html += '<div class="gallery-img" style="height:160px;background:linear-gradient(135deg,#3a3a3a,#666);display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:white;">&#10003;</div>';
    }
    html += '<div class="gallery-info"><h4>' + a.nome + ' <span class="badge-adottato">Adottato</span></h4>';
    html += '<p>' + a.citta + ' &middot; ' + a.anno_adozione + '</p></div>';
    html += '</div>';
  }

  grid.innerHTML = html;
}

/* ── RENDER CANI DISPONIBILI (pagina adotta) ── */
function renderDisponibili(data) {
  var container = document.getElementById('disponibiliList');
  if (!container) return;
  var disponibili = data.disponibili || [];
  var html = '';

  for (var i = 0; i < disponibili.length; i++) {
    var c = disponibili[i];
    var tags = '';
    if (c.tags) {
      for (var t = 0; t < c.tags.length; t++) {
        tags += '<span class="tag-chip">' + c.tags[t] + '</span>';
      }
    }
    var waLink = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(c.wa_testo || WA_DEFAULT);
    html += '<div class="dog-card">';
    html += '<div class="dog-header">';
    html += '<div class="dog-avatar"><img src="' + c.foto + '" alt="' + c.nome + '"></div>';
    html += '<div><div class="dog-name">' + c.nome + '</div>';
    html += '<div class="dog-meta">' + c.sesso + ' &middot; ' + c.mantello + (c.pedigree ? ' &middot; Pedigree' : '') + '</div></div>';
    html += '</div>';
    html += '<div class="dog-tags">' + tags + '</div>';
    html += '<div class="dog-desc">' + c.descrizione + '</div>';
    html += '<a href="' + waLink + '" target="_blank" class="btn-blue" style="text-decoration:none;display:block;text-align:center;">Chiedi di ' + c.nome + ' su WhatsApp</a>';
    html += '</div>';
  }

  container.innerHTML = html;
}

/* ── RENDER STORIE ADOTTATI ── */
function renderAdottati(data) {
  var container = document.getElementById('storieAdottati');
  if (!container) return;
  var adottati = data.adottati || [];
  var html = '';

  for (var i = 0; i < adottati.length; i++) {
    var a = adottati[i];
    var fotoHtml = a.foto
      ? '<img src="' + a.foto + '" alt="' + a.nome + '" style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:0.8rem;">'
      : '<div style="font-size:2.5rem;margin-bottom:0.8rem;color:var(--sky);">&#9829;</div>';
    html += '<div class="card">';
    html += fotoHtml;
    html += '<h3>"' + a.nome + ' con ' + a.famiglia + '"</h3>';
    html += '<p style="font-style:italic;color:var(--gray);">"' + a.storia + '"</p>';
    html += '<p style="margin-top:0.8rem;font-size:0.82rem;color:var(--sky);">' + a.citta + ' &middot; ' + a.anno_adozione + '</p>';
    html += '</div>';
  }

  container.innerHTML = html;
}

/* ── INIT ── */
window.addEventListener('load', function() {
  /* Modal click esterno per chiuderlo */
  var modal = document.getElementById('dogModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeDog();
    });
  }

  /* Carica cani dal JSON */
  caricaCani();
});
