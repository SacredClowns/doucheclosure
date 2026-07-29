/* ============================================================
   DOUCHECLOSURE ARCADE CABINET — v1
   Drop-in attract-mode start screen, controls card, high scores,
   and game-over card for every game in the arcade.

   USAGE:
     <script src="../../assets/arcade.js"></script>
     Arcade.cabinet({
       id: 'carcass',                       // unique, used for high score storage
       title: 'CARCASS TO CASSEROLE',
       subtitle: 'The 8-Minute Window',
       wing: 'THE JASON SANDS EXPERIENCE',
       accent: '#E2604A',
       howto: ['← COOLER', '↓ POT', '→ OUT-BIN', 'Sort before it lands'],
       lore: 'One paragraph the player actually reads while the coin drops.',
       scoreLabel: 'MEAT ON ICE',
       onStart: () => startGame()
     });

     Arcade.gameOver({ won:true, score:20, lines:['...'], onRetry: fn, links:[{label,href}] });
     Arcade.toast('🏆 ACHIEVEMENT');
   ============================================================ */
(function (global) {
  'use strict';

  var CSS = `
  .dcab-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;
    background:radial-gradient(ellipse at 50% 40%, rgba(20,10,35,.94), rgba(4,3,10,.985));
    font-family:"Courier New",Courier,monospace;color:#F4F0FF;padding:1rem;overflow-y:auto;}
  .dcab-overlay::after{content:"";position:absolute;inset:0;pointer-events:none;
    background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px);}
  .dcab-inner{position:relative;z-index:2;max-width:640px;width:100%;text-align:center;}
  .dcab-wing{font-size:.6rem;letter-spacing:.32em;text-transform:uppercase;color:#2DE1FC;margin-bottom:.9rem;}
  .dcab-title{font-family:Haettenschweiler,"Arial Narrow",Impact,sans-serif;font-weight:400;
    text-transform:uppercase;line-height:.92;font-size:clamp(2.2rem,9vw,4.4rem);margin:0;
    color:var(--dcab-accent);letter-spacing:.02em;}
  .dcab-sub{font-family:Haettenschweiler,"Arial Narrow",Impact,sans-serif;font-weight:400;
    text-transform:uppercase;font-size:clamp(1rem,3.4vw,1.5rem);color:#F4F0FF;margin:.35rem 0 0;letter-spacing:.06em;}
  .dcab-lore{color:#B9AFD0;font-size:.85rem;line-height:1.65;max-width:34rem;margin:1.25rem auto 0;}
  .dcab-lore b{color:#F4F0FF;}
  .dcab-card{border:2px dashed rgba(185,175,208,.35);border-radius:10px;padding:.9rem 1.1rem;
    margin:1.4rem auto 0;max-width:26rem;}
  .dcab-card h4{margin:0 0 .5rem;font-size:.6rem;letter-spacing:.26em;text-transform:uppercase;color:var(--dcab-accent);}
  .dcab-card ul{list-style:none;margin:0;padding:0;display:grid;gap:.3rem;}
  .dcab-card li{font-size:.78rem;color:#D6CFE8;letter-spacing:.04em;}
  .dcab-hs{margin-top:1rem;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#FFD23F;}
  .dcab-coin{margin-top:1.6rem;font-size:.95rem;letter-spacing:.3em;text-transform:uppercase;color:#3DFC8A;
    animation:dcabBlink 1.15s steps(1) infinite;}
  @keyframes dcabBlink{50%{opacity:.12}}
  .dcab-btn{display:inline-block;margin:1.1rem .3rem 0;padding:.9rem 1.9rem;border-radius:8px;cursor:pointer;
    font-family:inherit;font-weight:bold;font-size:.82rem;letter-spacing:.16em;text-transform:uppercase;
    border:2px solid var(--dcab-accent);background:var(--dcab-accent);color:#0B0614;text-decoration:none;}
  .dcab-btn:hover{filter:brightness(1.12);}
  .dcab-btn.ghost{background:transparent;color:#2DE1FC;border-color:#2DE1FC;}
  .dcab-foot{margin-top:1.4rem;font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:#6E6288;}
  @media (prefers-reduced-motion: reduce){.dcab-coin{animation:none}}

  .dcab-toast{position:fixed;top:76px;left:50%;transform:translateX(-50%);z-index:9500;
    background:#150C22;border:2px solid #FFD23F;border-radius:10px;padding:.55rem 1.1rem;text-align:center;
    font-family:"Courier New",monospace;animation:dcabIn .3s;}
  .dcab-toast .t1{color:#FFD23F;font-size:.58rem;letter-spacing:.26em;}
  .dcab-toast .t2{font-family:Haettenschweiler,Impact,sans-serif;font-size:1.1rem;text-transform:uppercase;color:#F4F0FF;}
  @keyframes dcabIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%)}}
  `;

  var styled = false;
  function injectCSS() {
    if (styled) return;
    styled = true;
    var s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function hs(id) {
    try { return parseInt(localStorage.getItem('dcab-hs-' + id) || '0', 10) || 0; } catch (e) { return 0; }
  }
  function setHs(id, v) {
    try { if (v > hs(id)) localStorage.setItem('dcab-hs-' + id, String(v)); } catch (e) {}
  }

  var current = null;

  function cabinet(cfg) {
    injectCSS();
    current = cfg;
    var accent = cfg.accent || '#FF3D8A';
    var best = hs(cfg.id);

    var ov = document.createElement('div');
    ov.className = 'dcab-overlay';
    ov.style.setProperty('--dcab-accent', accent);

    var howto = (cfg.howto || []).map(function (h) { return '<li>' + h + '</li>'; }).join('');

    ov.innerHTML =
      '<div class="dcab-inner">' +
        (cfg.wing ? '<div class="dcab-wing">' + cfg.wing + '</div>' : '') +
        '<h1 class="dcab-title">' + cfg.title + '</h1>' +
        (cfg.subtitle ? '<p class="dcab-sub">' + cfg.subtitle + '</p>' : '') +
        (cfg.lore ? '<p class="dcab-lore">' + cfg.lore + '</p>' : '') +
        (howto ? '<div class="dcab-card"><h4>Controls</h4><ul>' + howto + '</ul></div>' : '') +
        (best ? '<div class="dcab-hs">Cabinet record — ' + (cfg.scoreLabel || 'BEST') + ': ' + best + '</div>' : '') +
        '<div class="dcab-coin">&#9679; Insert coin to continue &#9679;</div>' +
        '<div><button class="dcab-btn" data-dcab-start>Press start</button>' +
        (cfg.shrine ? '<a class="dcab-btn ghost" href="' + cfg.shrine + '">Visit the shrine</a>' : '') +
        '</div>' +
        '<div class="dcab-foot">Doucheclosure Arcade &bull; One coin, one story</div>' +
      '</div>';

    document.body.appendChild(ov);

    function launch() {
      document.removeEventListener('keydown', keyStart);
      ov.remove();
      if (typeof cfg.onStart === 'function') cfg.onStart();
    }
    function keyStart(e) {
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); launch(); }
    }
    ov.querySelector('[data-dcab-start]').addEventListener('click', launch);
    ov.addEventListener('click', function (e) { if (e.target === ov) launch(); });
    document.addEventListener('keydown', keyStart);
  }

  function gameOver(o) {
    injectCSS();
    var cfg = current || {};
    var accent = o.accent || cfg.accent || '#FF3D8A';
    if (typeof o.score === 'number' && cfg.id) setHs(cfg.id, o.score);
    var best = cfg.id ? hs(cfg.id) : 0;

    var ov = document.createElement('div');
    ov.className = 'dcab-overlay';
    ov.style.setProperty('--dcab-accent', o.won ? (o.accent || '#3DFC8A') : '#FF3D8A');

    var lines = (o.lines || []).map(function (l) {
      return '<p class="dcab-lore">' + l + '</p>';
    }).join('');
    var links = (o.links || []).map(function (l) {
      return '<a class="dcab-btn ghost" href="' + l.href + '">' + l.label + '</a>';
    }).join('');

    ov.innerHTML =
      '<div class="dcab-inner">' +
        '<h1 class="dcab-title">' + (o.title || (o.won ? 'You did it' : 'Game over')) + '</h1>' +
        (typeof o.score === 'number'
          ? '<p class="dcab-sub">' + (cfg.scoreLabel || 'SCORE') + ': ' + o.score +
            (best ? ' &nbsp;·&nbsp; RECORD: ' + best : '') + '</p>' : '') +
        lines +
        '<div><button class="dcab-btn" data-dcab-retry>Play again</button>' + links + '</div>' +
        '<div class="dcab-foot">Doucheclosure Arcade &bull; The story outlasts the laughing</div>' +
      '</div>';

    document.body.appendChild(ov);
    ov.querySelector('[data-dcab-retry]').addEventListener('click', function () {
      ov.remove();
      if (typeof o.onRetry === 'function') o.onRetry(); else location.reload();
    });
  }

  function toast(text, kicker) {
    injectCSS();
    var el = document.createElement('div');
    el.className = 'dcab-toast';
    el.innerHTML = '<div class="t1">' + (kicker || 'Achievement unlocked') + '</div><div class="t2">' + text + '</div>';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
  }

  global.Arcade = { cabinet: cabinet, gameOver: gameOver, toast: toast, highScore: hs };
})(window);
