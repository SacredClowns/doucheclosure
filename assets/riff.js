/* ============================================================
   DOUCHECLOSURE RIFF — v1
   The comedy engine. A live commentary track that reacts to the
   player's ACTUAL play and gets progressively more unhinged.

   The problem this solves: jokes buried in prose nobody reads,
   while the gameplay itself is silent. Riff puts the comedy in
   the moment-to-moment, where people actually are.

   THREE THINGS IT DOES THAT A STATIC JOKE LIST CANNOT:
     1. ESCALATION — every line is tagged tier 1-3. The longer you
        play, the more deranged the commentary gets. Tier 1 is
        deadpan. Tier 3 should be indefensible.
     2. CALLBACKS — Riff remembers what you did and refers back
        to it. Repetition is the joke: "that's the fourth time."
     3. REACTIVITY — lines fire on what you DID, not on a timer.

     Riff.init({
       mount: '#annc',                  // element to write into (optional)
       bank: {
         start:  ['...'],               // tier 1 strings, or…
         good:   [[1,'deadpan'],[2,'weirder'],[3,'unhinged']],
         bad:    [...], streak:[...], fail:[...], idle:[...]
       }
     });
     Riff.hit('good');                  // fire a line for that trigger
     Riff.hit('bad', { thing:'CLAW' }); // {tokens} get substituted
     Riff.tier()                        // current escalation tier
     Riff.count('good')                 // how many times that's fired
   ============================================================ */
(function (global) {
  'use strict';

  var bank = {}, mountEl = null, counts = {}, seen = {}, started = 0, lastLine = '';

  var CSS =
  '.dc-riff{min-height:1.35rem;text-align:center;font-family:"Courier New",Courier,monospace;' +
  'font-size:.8rem;letter-spacing:.04em;color:#FFD23F;text-shadow:0 2px 0 #000;' +
  'padding:.4rem .75rem;transition:opacity .12s;}' +
  '.dc-riff.t2{color:#FF9E4D;}' +
  '.dc-riff.t3{color:#FF3D8A;font-weight:bold;}' +
  '.dc-riff.pop{animation:dcRiffPop .26s;}' +
  '@keyframes dcRiffPop{0%{transform:scale(.92);opacity:.4}60%{transform:scale(1.04)}100%{transform:scale(1)}}';

  function styles() {
    if (document.getElementById('dc-riff-css')) return;
    var s = document.createElement('style');
    s.id = 'dc-riff-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function init(cfg) {
    styles();
    cfg = cfg || {};
    bank = cfg.bank || {};
    counts = {}; seen = {}; started = Date.now();
    feverOn = cfg.fever !== false;   /* on by default; pass fever:false for calm games */
    lastTier = 0;
    if (cfg.mount) {
      mountEl = typeof cfg.mount === 'string' ? document.querySelector(cfg.mount) : cfg.mount;
      if (mountEl) mountEl.classList.add('dc-riff');
    }
    return global.Riff;
  }

  /* Escalation: tier 1 for the first stretch, then 2, then 3.
     Driven by total lines fired, not clock time — a player who is
     doing a lot should get the deranged material sooner. */
  function tier() {
    var n = 0;
    for (var k in counts) n += counts[k];
    if (n < 5) return 1;
    if (n < 12) return 2;
    return 3;
  }

  function norm(entry) {
    /* accepts 'string' or [tier, 'string'] */
    if (typeof entry === 'string') return { t: 1, s: entry };
    return { t: entry[0] || 1, s: entry[1] };
  }

  function pick(trigger) {
    var list = bank[trigger];
    if (!list || !list.length) return null;
    var cur = tier();
    var items = list.map(norm);

    /* prefer lines at or below current tier, favouring the highest available */
    var eligible = items.filter(function (i) { return i.t <= cur; });
    if (!eligible.length) eligible = items;

    var top = Math.max.apply(null, eligible.map(function (i) { return i.t; }));
    var best = eligible.filter(function (i) { return i.t === top; });

    /* don't repeat until the pool is exhausted */
    seen[trigger] = seen[trigger] || {};
    var fresh = best.filter(function (i) { return !seen[trigger][i.s]; });
    if (!fresh.length) { seen[trigger] = {}; fresh = best; }

    var chosen = fresh[Math.floor(Math.random() * fresh.length)];
    seen[trigger][chosen.s] = 1;
    return chosen.s;
  }

  function subst(str, tokens) {
    if (!tokens) return str;
    return str.replace(/\{(\w+)\}/g, function (m, k) {
      return tokens[k] != null ? tokens[k] : m;
    });
  }

  function hit(trigger, tokens) {
    counts[trigger] = (counts[trigger] || 0) + 1;
    var line = pick(trigger);
    if (!line) return null;

    /* automatic callback: the same trigger firing repeatedly IS a joke */
    var n = counts[trigger];
    tokens = tokens || {};
    tokens.n = n;
    tokens.nth = n === 2 ? 'second' : n === 3 ? 'third' : n === 4 ? 'fourth' :
                 n === 5 ? 'fifth' : n + 'th';

    var out = subst(line, tokens);
    if (out === lastLine) {                       /* never say the same thing twice running */
      var retry = pick(trigger);
      if (retry) out = subst(retry, tokens);
    }
    lastLine = out;
    say(out);
    return out;
  }

  /* FEVER: the screen degrades as the commentary escalates.
     Tier 1 is a normal game. By tier 3 the optics are bending —
     the player is not told this is happening, they just start to
     feel that something is wrong with the television. */
  var feverOn = false, lastTier = 0;
  function fever(t) {
    if (!feverOn || t === lastTier || !global.Optics || !global.Optics.active()) return;
    lastTier = t;
    var P = {
      1: { bloom: 1.15, curve: 0.075, aberr: 1.0, grain: 0.045, flicker: 0.5 },
      2: { bloom: 1.55, curve: 0.115, aberr: 2.2, grain: 0.075, flicker: 1.1 },
      3: { bloom: 2.10, curve: 0.170, aberr: 4.0, grain: 0.115, flicker: 2.0 }
    }[t];
    if (!P) return;
    for (var k in P) global.Optics.set(k, P[k]);
    if (t === 3 && global.Juice) { global.Juice.shake(5, 500); global.Juice.sfx('alarm'); }
  }

  function say(text) {
    if (!mountEl) return;
    mountEl.textContent = text;
    var t = tier();
    fever(t);
    mountEl.classList.remove('t2', 't3', 'pop');
    if (t === 2) mountEl.classList.add('t2');
    if (t === 3) mountEl.classList.add('t3');
    void mountEl.offsetWidth;                     /* restart the animation */
    mountEl.classList.add('pop');
  }

  global.Riff = {
    init: init, hit: hit, say: say, tier: tier,
    count: function (k) { return counts[k] || 0; },
    reset: function () { counts = {}; seen = {}; started = Date.now(); lastLine = ''; }
  };
})(window);
