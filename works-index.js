/* ── Índice de trabajos — preview al hover ──
   Cada .wi-item lleva data-img y data-cat. Al pasar el mouse (o enfocar
   con teclado) muestra la miniatura + categoría en .wi-preview. Los
   items --soon no tienen preview. No hace nada si no existe .works-index. */
(function(){
  var idx = document.querySelector(".works-index");
  if (!idx) return;
  var preview = idx.querySelector(".wi-preview");
  var thumb = idx.querySelector(".wi-thumb");
  var name = idx.querySelector(".wi-name");
  var cat = idx.querySelector(".wi-cat");
  if (!preview) return;

  var hideTimer;
  function show(el){
    clearTimeout(hideTimer);
    var img = el.getAttribute("data-img");
    thumb.style.backgroundImage = img ? "url('" + img + "')" : "none";
    name.textContent = el.getAttribute("data-name") || el.textContent.replace(/\s*○\s*$/, "").trim();
    cat.textContent = el.getAttribute("data-cat") || "";
    preview.classList.add("is-active");
  }
  function scheduleHide(){
    hideTimer = setTimeout(function(){ preview.classList.remove("is-active"); }, 250);
  }

  idx.querySelectorAll(".wi-item").forEach(function(el){
    if (el.classList.contains("wi-item--soon")) return;
    el.addEventListener("mouseenter", function(){ show(el); });
    el.addEventListener("mouseleave", scheduleHide);
    el.addEventListener("focus", function(){ show(el); });
    el.addEventListener("blur", scheduleHide);
  });
})();
