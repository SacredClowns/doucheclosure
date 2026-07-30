/* ============================================================
   DOUCHECLOSURE — STANDING PARODY NOTICE
   Injected on every page so the framing is consistent and
   unmissable. Consistency is the point: a parody notice that
   appears everywhere is worth far more than one buried on a
   single page.

     <script src="/assets/legal.js"></script>   (or ../../assets/legal.js)

   Renders itself at the end of <body>. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  var CSS =
  '.dc-legal{border-top:2px solid #35205C;background:#0B0614;color:#7E6F9E;' +
  'font-family:"Courier New",Courier,monospace;font-size:.66rem;line-height:1.75;' +
  'letter-spacing:.03em;padding:1.6rem 1.25rem 2.2rem;text-align:center;}' +
  '.dc-legal .in{max-width:52rem;margin:0 auto;}' +
  '.dc-legal b{color:#B9AFD0;}' +
  '.dc-legal .hd{color:#FFD23F;letter-spacing:.24em;font-size:.6rem;' +
  'text-transform:uppercase;margin-bottom:.6rem;}' +
  '.dc-legal a{color:#2DE1FC;}' +
  '.dc-legal p{margin:0 0 .55rem;}';

  var HTML =
  '<div class="in">' +
    '<p class="hd">Standing Notice</p>' +
    '<p><b>DOUCHECLOSURE IS A WORK OF PARODY AND SATIRE.</b> Every wing, game, dossier, recipe, ' +
    'and product on this site is comedy and social commentary on the public statements, public ' +
    'appearances, and public conduct of public figures regarding a matter of public concern.</p>' +
    '<p><b>Nothing here is a statement of fact about any real person.</b> We do not assert that any ' +
    'individual has committed any wrongdoing, crime, fraud, or deception. Where a real person&rsquo;s ' +
    'public claims are described, they are described as claims. Dialogue appearing inside games is ' +
    'obvious fiction written by us and was never said by anyone.</p>' +
    '<p><b>No affiliation. No endorsement.</b> Doucheclosure is not affiliated with, sponsored by, ' +
    'endorsed by, or authorized by any person, agency, program, or organization referenced. Names ' +
    'are used solely to identify the subject of commentary.</p>' +
    '<p><b>We believe the witnesses.</b> That is the joke and it is also sincere. This publication ' +
    'does not mock experiencers, whistleblowers, service members, anyone&rsquo;s health, faith, or ' +
    'family. It makes fun of paperwork, invoices, and institutions.</p>' +
    '<p><b>Corrections and removal.</b> If you are depicted here and want a link corrected or added, ' +
    'or want your wing removed entirely, contact us and it will be done — promptly, without ' +
    'argument, and without conditions.</p>' +
    '<p style="margin-top:.9rem;">&copy; 2026 Doucheclosure Press &bull; ' +
    '<a href="/index.html">The Arcade</a> &bull; <a href="/shrines/index.html">The Hall of Shrines</a></p>' +
  '</div>';

  function mount() {
    if (document.querySelector('.dc-legal')) return;
    var s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
    var d = document.createElement('div');
    d.className = 'dc-legal';
    d.innerHTML = HTML;
    document.body.appendChild(d);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
