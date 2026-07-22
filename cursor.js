/* ── Cursor de cuadraditos — estela que sigue el mouse ──
   Estilo joyseet: una fila de cuadrados rojos que persiguen el puntero
   con easing decreciente (efecto snake). El cuadrado líder crece y se
   vuelve contorno al pasar sobre links/botones. No toca el cursor nativo
   (queda visible por accesibilidad). Se desactiva en touch y con
   prefers-reduced-motion. */
(function(){
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;

  var N = 7;
  var squares = [];
  for (var i = 0; i < N; i++){
    var el = document.createElement("div");
    el.className = "cursor-sq";
    var size = 11 - i;                 // el líder es el más grande
    el.style.width = el.style.height = size + "px";
    el.style.marginLeft = el.style.marginTop = (-size / 2) + "px";
    el.style.opacity = (1 - i / (N + 1)).toFixed(2);
    document.body.appendChild(el);
    squares.push({ el: el, x: window.innerWidth / 2, y: window.innerHeight / 2, size: size });
  }

  var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  var hovering = false;

  window.addEventListener("mousemove", function(e){
    mx = e.clientX; my = e.clientY;
  }, { passive: true });

  document.addEventListener("mouseover", function(e){
    var t = e.target.closest ? e.target.closest("a, button, .hc-item, .mc-item, .car-card, .portfolio-card, [role=button]") : null;
    hovering = !!t;
  });

  function raf(){
    var px = mx, py = my;
    for (var i = 0; i < squares.length; i++){
      var sq = squares[i];
      var ease = 0.32 - i * 0.02;
      sq.x += (px - sq.x) * ease;
      sq.y += (py - sq.y) * ease;
      var scale = (i === 0 && hovering) ? 2.1 : 1;
      sq.el.style.transform = "translate(" + sq.x + "px," + sq.y + "px) rotate(45deg) scale(" + scale + ")";  // rombo/diamante
      px = sq.x; py = sq.y;
    }
    document.body.classList.toggle("cursor-hovering", hovering);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();
