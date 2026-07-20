/* ── Transición de página tipo Salient: cortina ──
   Al clickear un link interno, una cortina oscura sube desde abajo y cubre
   la pantalla; recién ahí navega. En la página nueva, la cortina arranca
   cubriendo todo y sigue subiendo hasta salir por arriba, revelando el
   contenido. Respeta prefers-reduced-motion (navega directo). */
(function(){
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (REDUCED) return;

  // La cortina se inyecta acá para no tocar el HTML de cada página
  var curtain = document.createElement("div");
  curtain.className = "page-curtain";
  curtain.setAttribute("aria-hidden", "true");
  document.body.appendChild(curtain);

  // ¿Venimos de una transición? → la cortina arranca cubriendo y se retira hacia arriba
  var arrived = false;
  try { arrived = sessionStorage.getItem("curtain") === "1"; sessionStorage.removeItem("curtain"); } catch(e){}
  if (arrived){
    curtain.classList.add("is-cover");           // cubre todo, sin animación
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        curtain.classList.add("is-leaving");     // sube y sale por arriba
        curtain.classList.remove("is-cover");
      });
    });
    curtain.addEventListener("transitionend", function(){
      curtain.classList.remove("is-leaving");
    }, { once: true });
  }

  // bfcache: si volvés con "atrás", limpiá cualquier estado de cortina
  window.addEventListener("pageshow", function(e){
    if (e.persisted) curtain.className = "page-curtain";
  });

  // Interceptar links internos a .html (sin _blank, sin externos, sin anclas puras)
  document.addEventListener("click", function(e){
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    if (!/\.html(#.*)?$/.test(href)) return;
    if (href.indexOf("://") !== -1) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    try { sessionStorage.setItem("curtain", "1"); } catch(err){}
    curtain.classList.add("is-entering");        // sube desde abajo y cubre
    setTimeout(function(){ window.location.href = href; }, 650);
  });
})();
