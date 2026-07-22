/* ── Casos ──
   Desktop (>1080px): menú flotante a la izquierda. Al pasar el mouse por
   un caso, aparece la miniatura EN LÍNEA con ese item (a su altura). El
   menú se oculta al llegar al bloque oscuro / carrusel del final.
   Mobile (<=1080px): acordeón "Casos" debajo de la meta (Alcance). */
(function(){
  var menu = document.querySelector(".hub-cases");
  if (!menu) return;
  var isMobile = window.matchMedia && window.matchMedia("(max-width: 1080px)").matches;

  // ── Mobile: acordeón debajo de la meta ──
  if (isMobile){
    var meta = document.querySelector(".hub-meta-bar");
    if (meta && !document.querySelector(".mc-accordion")){
      var head = menu.querySelector(".hc-head");
      var label = head ? head.textContent.trim() : "Casos";
      var isEN = (document.documentElement.lang || "").indexOf("en") === 0;
      var items = menu.querySelectorAll(".hc-item");
      var lis = "";
      items.forEach(function(el){
        var name = el.querySelector(".hc-name").textContent;
        if (el.classList.contains("hc-item--soon"))
          lis += '<li><span class="mc-item mc-item--soon">' + name + "</span></li>";
        else
          lis += '<li><a class="mc-item" href="' + el.getAttribute("href") + '">' + name + "</a></li>";
      });
      var box = document.createElement("div");
      box.className = "container mc-container";
      box.innerHTML =
        '<div class="mc-accordion">' +
          '<button class="mc-toggle" aria-expanded="false">' + label +
            ' <span class="mc-count">(' + items.length + ')</span>' +
            '<span class="mc-chevron" aria-hidden="true"></span></button>' +
          '<div class="mc-wrap"><ul class="mc-list">' + lis + "</ul>" +
            '<a class="mc-all" href="#hub-casos">' + (isEN ? "View all →" : "Ver todos →") + "</a>" +
          "</div>" +
        "</div>";
      meta.parentNode.insertBefore(box, meta.nextSibling);
      var acc = box.querySelector(".mc-accordion");
      box.querySelector(".mc-toggle").addEventListener("click", function(){
        var open = acc.classList.toggle("is-open");
        this.setAttribute("aria-expanded", String(open));
      });
    }
    return;
  }

  // ── Desktop: hover → miniatura en línea con el item ──
  var preview = menu.querySelector(".hc-preview");
  var thumb = preview ? preview.querySelector(".hc-thumb") : null;
  // La sacamos del .container y la colgamos del body: así ninguna sección
  // oscura full-bleed la tapa (queda fuera de todo contexto de apilado).
  if (preview) document.body.appendChild(preview);
  var hideTimer;
  menu.querySelectorAll(".hc-item").forEach(function(el){
    if (el.classList.contains("hc-item--soon")) return;
    el.addEventListener("mouseenter", function(){
      var img = el.getAttribute("data-img");
      if (!img || !preview) return;
      clearTimeout(hideTimer);
      thumb.style.backgroundImage = "url('" + img + "')";
      var r = el.getBoundingClientRect();
      var top = r.top + r.height / 2 - 97;   // centrada en el item (miniatura 194px) → más arriba
      if (top < 88) top = 88;                // no tapar el header
      preview.style.top = Math.round(top) + "px";
      preview.classList.add("is-active");
    });
    el.addEventListener("mouseleave", function(){
      hideTimer = setTimeout(function(){ if (preview) preview.classList.remove("is-active"); }, 180);
    });
  });

  // ── Posición bajo el header + ocultar al llegar al bloque oscuro/carrusel ──
  var header = null, EXP = 200;
  var stopEl = document.querySelector(".hub-pullquote") || document.getElementById("hub-casos");
  function measure(){
    header = header || document.getElementById("siteHeader");
    if (header && window.scrollY < 10) EXP = header.offsetHeight + 24;
  }
  function update(){
    menu.style.top = (window.scrollY > 60 ? 80 : EXP) + "px";
    if (stopEl){
      var hide = stopEl.getBoundingClientRect().top < menu.getBoundingClientRect().bottom + 24;
      menu.classList.toggle("hc-hidden", hide);
      if (hide && preview) preview.classList.remove("is-active");
    }
  }
  window.addEventListener("load", function(){ measure(); update(); });
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", function(){ measure(); update(); });
  update();
})();
