/* ============================================================
   DOUCHECLOSURE OPTICS — v1
   Drop-in WebGL post-processing for any 2D canvas game.
   Bloom · CRT barrel curve · chromatic aberration · shadow mask
   · scanlines · vignette · film grain · subtle flicker.

   The game keeps drawing to its normal 2D canvas and does NOT
   change one line. This hijacks the display and re-renders it
   through a shader every frame.

     <script src="../../assets/screen.js"></script>
     Optics.apply(document.getElementById('game'));           // defaults
     Optics.apply(cv, { bloom: 1.4, curve: 0.10, grain: .05 });
     Optics.off();

   Fails silently and leaves the plain canvas visible if WebGL
   is unavailable — never breaks a game.
   ============================================================ */
(function (global) {
  'use strict';

  var VERT = [
    'attribute vec2 p;',
    'varying vec2 uv;',
    'void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision mediump float;',
    'varying vec2 uv;',
    'uniform sampler2D tex;',
    'uniform vec2 res;',
    'uniform float time;',
    'uniform float uBloom, uCurve, uAberr, uScan, uGrain, uVig, uMask, uFlicker;',

    /* barrel distortion — the glass */
    'vec2 curve(vec2 p){',
    '  p = p * 2.0 - 1.0;',
    '  vec2 off = abs(p.yx) / vec2(6.0, 5.0);',
    '  p = p + p * off * off * uCurve * 6.0;',
    '  return p * 0.5 + 0.5;',
    '}',

    'vec3 sampleRGB(vec2 c){',
    /* chromatic aberration grows toward the edges, like a real lens */
    '  vec2 d = c - 0.5;',
    '  float r2 = dot(d, d);',
    '  vec2 sh = d * r2 * 0.035 * uAberr;',
    '  float r = texture2D(tex, c + sh).r;',
    '  float g = texture2D(tex, c).g;',
    '  float b = texture2D(tex, c - sh).b;',
    '  return vec3(r, g, b);',
    '}',

    /* thresholded multi-tap bloom — cheap, and gorgeous on neon-over-black */
    'vec3 bloom(vec2 c){',
    '  vec3 sum = vec3(0.0);',
    '  vec2 px = 1.0 / res;',
    '  const int RINGS = 3;',
    '  float total = 0.0;',
    '  for (int i = 1; i <= RINGS; i++){',
    '    float rad = float(i) * 2.6;',
    '    float w = 1.0 / float(i);',
    '    for (int k = 0; k < 8; k++){',
    '      float a = float(k) * 0.7853981634;',
    '      vec2 o = vec2(cos(a), sin(a)) * rad * px * 3.0;',
    '      vec3 s = texture2D(tex, c + o).rgb;',
    '      float lum = dot(s, vec3(0.299, 0.587, 0.114));',
    '      s *= smoothstep(0.45, 0.95, lum);',   /* only bright things bloom */
    '      sum += s * w;',
    '      total += w;',
    '    }',
    '  }',
    '  return sum / max(total, 0.0001);',
    '}',

    'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',

    'void main(){',
    '  vec2 c = curve(uv);',
    /* outside the tube = black bezel */
    '  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0){',
    '    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return;',
    '  }',
    '  vec3 col = sampleRGB(c);',
    '  col += bloom(c) * uBloom;',

    /* scanlines */
    '  float sl = sin(c.y * res.y * 1.6);',
    '  col *= 1.0 - uScan * 0.16 * (0.5 + 0.5 * sl);',

    /* aperture-grille shadow mask */
    '  float m = mod(gl_FragCoord.x, 3.0);',
    '  vec3 mask = vec3(1.0);',
    '  if (m < 1.0)      mask = vec3(1.06, 0.96, 0.96);',
    '  else if (m < 2.0) mask = vec3(0.96, 1.06, 0.96);',
    '  else              mask = vec3(0.96, 0.96, 1.06);',
    '  col *= mix(vec3(1.0), mask, uMask);',

    /* vignette */
    '  vec2 v = c * (1.0 - c.yx);',
    '  float vig = pow(v.x * v.y * 22.0, 0.28);',
    '  col *= mix(1.0, clamp(vig, 0.0, 1.0), uVig);',

    /* film grain + faint mains flicker */
    '  float g = hash(gl_FragCoord.xy + fract(time) * 91.7) - 0.5;',
    '  col += g * uGrain;',
    '  col *= 1.0 - uFlicker * 0.04 * sin(time * 7.3);',

    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  var state = null;

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[Optics] shader:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function apply(src, opts) {
    if (!src || !src.getContext) return null;
    off();
    opts = opts || {};

    var out = document.createElement('canvas');
    var gl = out.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false })
          || out.getContext('experimental-webgl');
    if (!gl) return null;                       // no WebGL: leave the game alone

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[Optics] link:', gl.getProgramInfoLog(prog));
      return null;
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    var U = {};
    ['res','time','uBloom','uCurve','uAberr','uScan','uGrain','uVig','uMask','uFlicker']
      .forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    /* Overlay the output exactly on top of the source.
       The source MUST stay in layout (games size from clientWidth) and MUST keep
       receiving pointer events (games bind listeners to it), so it is merely made
       invisible, and the overlay is pointer-transparent. */
    var parent = src.parentNode;
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    out.style.cssText = 'position:absolute;pointer-events:none;';
    parent.insertBefore(out, src.nextSibling);
    src.style.opacity = '0';

    var cfg = {
      bloom:    opts.bloom    == null ? 1.15 : opts.bloom,
      curve:    opts.curve    == null ? 0.09 : opts.curve,
      aberr:    opts.aberration == null ? 1.0 : opts.aberration,
      scan:     opts.scanline == null ? 0.75 : opts.scanline,
      grain:    opts.grain    == null ? 0.045 : opts.grain,
      vig:      opts.vignette == null ? 0.85 : opts.vignette,
      mask:     opts.mask     == null ? 0.55 : opts.mask,
      flicker:  opts.flicker  == null ? 0.5  : opts.flicker
    };

    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { cfg.flicker = 0; cfg.grain *= 0.4; }

    var raf = 0, t0 = performance.now();

    function size() {
      /* backing store follows the source's backing store */
      if (out.width !== src.width || out.height !== src.height) {
        out.width = src.width || 1;
        out.height = src.height || 1;
      }
      /* CSS box follows the source's on-screen box, in the parent's coordinates */
      var l = src.offsetLeft, t = src.offsetTop,
          w = src.offsetWidth, h = src.offsetHeight;
      if (l !== lastL || t !== lastT || w !== lastW || h !== lastH) {
        lastL = l; lastT = t; lastW = w; lastH = h;
        out.style.left = l + 'px';
        out.style.top = t + 'px';
        out.style.width = w + 'px';
        out.style.height = h + 'px';
      }
    }
    var lastL, lastT, lastW, lastH;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      size();
      gl.viewport(0, 0, out.width, out.height);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      } catch (e) { return; }
      gl.uniform2f(U.res, out.width, out.height);
      gl.uniform1f(U.time, (now - t0) / 1000);
      gl.uniform1f(U.uBloom, cfg.bloom);
      gl.uniform1f(U.uCurve, cfg.curve);
      gl.uniform1f(U.uAberr, cfg.aberr);
      gl.uniform1f(U.uScan, cfg.scan);
      gl.uniform1f(U.uGrain, cfg.grain);
      gl.uniform1f(U.uVig, cfg.vig);
      gl.uniform1f(U.uMask, cfg.mask);
      gl.uniform1f(U.uFlicker, cfg.flicker);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    raf = requestAnimationFrame(frame);

    state = {
      src: src, out: out, gl: gl, cfg: cfg,
      stop: function () {
        cancelAnimationFrame(raf);
        if (out.parentNode) out.parentNode.removeChild(out);
        src.style.opacity = '';
      }
    };
    return state;
  }

  function off() { if (state) { state.stop(); state = null; } }
  function set(k, v) { if (state && state.cfg && k in state.cfg) state.cfg[k] = v; }

  global.Optics = { apply: apply, off: off, set: set, active: function () { return !!state; } };
})(window);
