/* ============================================================
   DOUCHECLOSURE JUICE — v1
   Zero-asset game feel: procedural audio, screenshake, hitstop,
   particles, floating text, flashes, haptics.

   Self-managing: creates its own overlay canvas + RAF loop.
   Games only call triggers. Nothing to draw, nothing to update.

     <script src="../../assets/juice.js"></script>
     Juice.init(document.getElementById('game'));   // canvas or element to shake

     Juice.sfx('hit');            // hit pickup good bad win lose click
                                  // whoosh thud alarm blip coin tick shatter
     Juice.shake(8);              // power (px), optional duration ms
     Juice.hitstop(60);           // freeze the world briefly
     Juice.burst(x, y, {color:'#FFD23F', count:14});
     Juice.text(x, y, 'PERFECT', {color:'#3DFC8A'});
     Juice.flash('#FF3D8A', .35);
     Juice.buzz(20);              // mobile haptic
     Juice.frozen()               // -> bool, respect this in your update loop
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- audio: everything synthesized, no files ---------- */
  var ac = null, master = null, muted = false;
  function audio() {
    if (!ac) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = 0.45;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (e) {
    global.addEventListener(e, function unlock() { audio(); }, { once: true, passive: true });
  });

  function tone(o) {
    var a = audio(); if (!a || muted) return;
    var t0 = a.currentTime + (o.delay || 0);
    var osc = a.createOscillator();
    var g = a.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.f0, t0);
    if (o.f1 && o.f1 !== o.f0) {
      if (o.slide === 'exp') osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t0 + o.dur);
      else osc.frequency.linearRampToValueAtTime(o.f1, t0 + o.dur);
    }
    var peak = (o.gain == null ? 0.22 : o.gain);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(g);
    if (o.filter) {
      var f = a.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = o.filter;
      g.connect(f); f.connect(master);
    } else g.connect(master);
    osc.start(t0); osc.stop(t0 + o.dur + 0.03);
  }

  function noise(o) {
    var a = audio(); if (!a || muted) return;
    var dur = o.dur || 0.18;
    var len = Math.floor(a.sampleRate * dur);
    var buf = a.createBuffer(1, len, a.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) {
      var env = Math.pow(1 - i / len, o.curve || 2);
      d[i] = (Math.random() * 2 - 1) * env;
    }
    var src = a.createBufferSource(); src.buffer = buf;
    var f = a.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.frequency.value = o.freq || 900;
    f.Q.value = o.q || 1;
    var g = a.createGain(); g.gain.value = (o.gain == null ? 0.3 : o.gain);
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
  }

  var SFX = {
    click:   function () { tone({ f0: 620, f1: 480, dur: 0.05, type: 'square', gain: 0.12 }); },
    blip:    function () { tone({ f0: 880, dur: 0.05, type: 'triangle', gain: 0.14 }); },
    tick:    function () { tone({ f0: 1400, dur: 0.03, type: 'square', gain: 0.07 }); },
    hit:     function () { noise({ freq: 320, dur: 0.14, q: 0.7, gain: 0.34 });
                           tone({ f0: 180, f1: 60, dur: 0.14, type: 'square', slide: 'exp', gain: 0.22 }); },
    thud:    function () { tone({ f0: 120, f1: 42, dur: 0.22, type: 'sine', slide: 'exp', gain: 0.34 }); },
    shatter: function () { noise({ freq: 2600, dur: 0.3, q: 0.5, gain: 0.26, curve: 1.4 });
                           tone({ f0: 900, f1: 200, dur: 0.25, type: 'sawtooth', slide: 'exp', gain: 0.1 }); },
    pickup:  function () { tone({ f0: 660, dur: 0.07, type: 'square', gain: 0.16 });
                           tone({ f0: 990, dur: 0.09, type: 'square', gain: 0.14, delay: 0.06 }); },
    coin:    function () { tone({ f0: 988, dur: 0.06, type: 'square', gain: 0.15 });
                           tone({ f0: 1319, dur: 0.16, type: 'square', gain: 0.15, delay: 0.055 }); },
    good:    function () { [523, 659, 784].forEach(function (f, i) {
                             tone({ f0: f, dur: 0.16, type: 'triangle', gain: 0.16, delay: i * 0.06 }); }); },
    win:     function () { [523, 659, 784, 1047].forEach(function (f, i) {
                             tone({ f0: f, dur: 0.42, type: 'triangle', gain: 0.19, delay: i * 0.11 }); }); },
    bad:     function () { tone({ f0: 300, f1: 90, dur: 0.3, type: 'sawtooth', slide: 'exp', gain: 0.2, filter: 1200 }); },
    lose:    function () { [392, 330, 262, 196].forEach(function (f, i) {
                             tone({ f0: f, dur: 0.34, type: 'sawtooth', gain: 0.17, delay: i * 0.13, filter: 1400 }); }); },
    whoosh:  function () { noise({ freq: 700, dur: 0.26, q: 0.6, gain: 0.16, curve: 1.1 }); },
    alarm:   function () { for (var i = 0; i < 3; i++)
                             tone({ f0: 880, f1: 660, dur: 0.12, type: 'square', gain: 0.16, delay: i * 0.16 }); }
  };

  function sfx(name) { var f = SFX[name]; if (f) try { f(); } catch (e) {} }

  /* ---------- overlay canvas ---------- */
  var host = null, layer = null, lctx = null, parts = [], texts = [],
      shakeP = 0, shakeT = 0, flashC = null, flashA = 0, freezeUntil = 0, running = false;

  function ensureLayer() {
    if (layer) return;
    layer = document.createElement('canvas');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:8000;';
    document.body.appendChild(layer);
    lctx = layer.getContext('2d');
    resize();
    global.addEventListener('resize', resize);
  }
  function resize() {
    if (!layer) return;
    layer.width = global.innerWidth;
    layer.height = global.innerHeight;
  }

  function init(el) {
    host = el || null;
    ensureLayer();
    if (!running) { running = true; requestAnimationFrame(loop); }
    return global.Juice;
  }

  /* map a coordinate that may be canvas-space into page space */
  function toPage(x, y) {
    if (!host || !host.getBoundingClientRect) return { x: x, y: y };
    var r = host.getBoundingClientRect();
    var w = host.width || r.width, h = host.height || r.height;
    return { x: r.left + x * (r.width / w), y: r.top + y * (r.height / h) };
  }

  /* ---------- triggers ---------- */
  function shake(power, dur) {
    shakeP = Math.max(shakeP, power == null ? 6 : power);
    shakeT = Math.max(shakeT, dur == null ? 260 : dur);
  }
  function hitstop(ms) { freezeUntil = Math.max(freezeUntil, performance.now() + (ms || 55)); }
  function frozen() { return performance.now() < freezeUntil; }

  function burst(x, y, o) {
    ensureLayer();
    o = o || {};
    var p = toPage(x, y);
    var n = o.count || 12;
    var spd = o.speed || 3.4;
    for (var i = 0; i < n; i++) {
      var a = (o.angle == null ? Math.random() * Math.PI * 2 : o.angle + (Math.random() - .5) * (o.spread || 1.4));
      var v = spd * (0.45 + Math.random());
      parts.push({
        x: p.x, y: p.y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 1, decay: 0.012 + Math.random() * 0.02,
        size: o.size || (2 + Math.random() * 3),
        color: o.color || '#FFD23F',
        grav: o.gravity == null ? 0.06 : o.gravity
      });
    }
    if (parts.length > 500) parts.splice(0, parts.length - 500);
  }

  function text(x, y, str, o) {
    ensureLayer();
    o = o || {};
    var p = toPage(x, y);
    texts.push({
      x: p.x, y: p.y, str: String(str),
      color: o.color || '#F4F0FF',
      size: o.size || 20,
      life: 1, decay: o.decay || 0.014,
      vy: o.vy == null ? -0.9 : o.vy
    });
    if (texts.length > 40) texts.shift();
  }

  function flash(color, alpha) {
    ensureLayer();
    flashC = color || '#F4F0FF';
    flashA = Math.max(flashA, alpha == null ? 0.3 : alpha);
  }

  function buzz(ms) {
    if (navigator.vibrate) try { navigator.vibrate(ms || 15); } catch (e) {}
  }

  /* combo helpers — the one-liners games actually want */
  function impact(x, y, o) {
    o = o || {};
    sfx(o.sound || 'hit');
    shake(o.power || 7);
    hitstop(o.stop == null ? 45 : o.stop);
    burst(x, y, { color: o.color || '#FF3D8A', count: o.count || 14 });
    buzz(18);
    if (o.text) text(x, y - 18, o.text, { color: o.color || '#FF3D8A' });
  }
  function reward(x, y, o) {
    o = o || {};
    sfx(o.sound || 'pickup');
    burst(x, y, { color: o.color || '#3DFC8A', count: o.count || 16, speed: 4, gravity: 0.02 });
    if (o.text) text(x, y - 16, o.text, { color: o.color || '#3DFC8A' });
    buzz(10);
  }

  /* ---------- loop ---------- */
  var last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(50, now - last) || 16; last = now;

    // shake the host element
    if (shakeT > 0) {
      shakeT -= dt;
      var k = Math.max(0, shakeT) / 260;
      var mag = shakeP * k;
      if (host && host.style) {
        host.style.transform = 'translate(' + ((Math.random() - .5) * mag).toFixed(2) + 'px,' +
                                              ((Math.random() - .5) * mag).toFixed(2) + 'px)';
      }
      if (shakeT <= 0) { shakeP = 0; if (host && host.style) host.style.transform = ''; }
    }

    if (!lctx) return;
    lctx.clearRect(0, 0, layer.width, layer.height);

    // particles
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy += p.grav; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      lctx.globalAlpha = Math.max(0, p.life);
      lctx.fillStyle = p.color;
      lctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    // floating text
    for (var j = texts.length - 1; j >= 0; j--) {
      var t = texts[j];
      t.y += t.vy; t.life -= t.decay;
      if (t.life <= 0) { texts.splice(j, 1); continue; }
      lctx.globalAlpha = Math.max(0, Math.min(1, t.life * 1.4));
      lctx.fillStyle = t.color;
      lctx.font = 'bold ' + t.size + 'px Haettenschweiler, "Arial Narrow", Impact, sans-serif';
      lctx.textAlign = 'center';
      lctx.strokeStyle = 'rgba(0,0,0,.85)'; lctx.lineWidth = 4;
      lctx.strokeText(t.str, t.x, t.y);
      lctx.fillText(t.str, t.x, t.y);
    }
    // flash
    if (flashA > 0.002) {
      lctx.globalAlpha = flashA;
      lctx.fillStyle = flashC;
      lctx.fillRect(0, 0, layer.width, layer.height);
      flashA *= 0.86;
    }
    lctx.globalAlpha = 1;
  }

  global.Juice = {
    init: init, sfx: sfx, shake: shake, hitstop: hitstop, frozen: frozen,
    burst: burst, text: text, flash: flash, buzz: buzz,
    impact: impact, reward: reward,
    mute: function (v) { muted = !!v; },
    isMuted: function () { return muted; }
  };
})(window);
