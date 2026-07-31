/* ── Header compartido — Mameluco Rojo ──
   Construye en TODAS las páginas el header fijo con:
   · barra superior: links de la página (← volver / EN·ES) + reloj + "Hablemos"
   · el wordmark PAULA AZCUE animado, que al scrollear se ordena en una
     línea y sube a la barra (sin achicarse)
   Si la página tenía un nav.site-case, sus links se mudan a la barra. */
(function(){
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LETTERS = "PAULAAZCUE".split("");
  var COLS = 12, ROWS = 4;
  var CONFIGS = [
    {cells:[[0,1],[1,1],[2,1],[3,1],[4,1],[6,1],[7,1],[8,1],[9,1],[10,1]], extra:[[5,1]]},
    {cells:[[3,1],[4,1],[5,1],[6,1],[7,1],[3,2],[4,2],[5,2],[6,2],[7,2]]},
    {cells:[[4,0],[5,0],[4,1],[5,1],[6,1],[3,2],[4,2],[5,2],[6,2],[7,2]]},
    {cells:[[2,1],[3,1],[4,1],[5,1],[6,1],[4,2],[5,2],[6,2],[7,2],[8,2]]},
    {cells:[[2,1],[3,1],[4,1],[5,1],[6,1],[7,2],[8,2],[9,2],[10,2],[11,2]]},
    {cells:[[1,0],[2,0],[3,0],[4,0],[5,0],[6,2],[7,2],[8,2],[9,2],[10,2]], hull:true}
  ];

  function boundary(cells, S){
    var em = new Map();
    cells.forEach(function(cell){
      var c = cell[0], r = cell[1];
      var p = [[c,r],[c+1,r],[c+1,r+1],[c,r+1]];
      for (var i = 0; i < 4; i++){
        var a = p[i], b = p[(i+1)%4];
        var rev = b.join() + "|" + a.join();
        if (em.has(rev)) em.delete(rev);
        else em.set(a.join() + "|" + b.join(), [a,b]);
      }
    });
    var nxt = new Map();
    em.forEach(function(e){ nxt.set(e[0].join(), e[1]); });
    var d = "";
    while (nxt.size > 0){
      var entry = nxt.entries().next().value;
      var startKey = entry[0];
      var start = startKey.split(",").map(Number);
      var pts = [start];
      var cur = entry[1];
      nxt.delete(startKey);
      while (cur.join() !== startKey){
        pts.push(cur);
        var k = cur.join();
        var next = nxt.get(k);
        nxt.delete(k);
        cur = next;
      }
      d += "M" + pts.map(function(pt){ return (pt[0]*S) + "," + (pt[1]*S); }).join(" L ") + " Z ";
    }
    return d;
  }

  function hull(cells, S){
    var pts = [];
    cells.forEach(function(c){
      pts.push([c[0],c[1]],[c[0]+1,c[1]],[c[0]+1,c[1]+1],[c[0],c[1]+1]);
    });
    pts.sort(function(a,b){ return a[0]-b[0] || a[1]-b[1]; });
    function cross(o,a,b){ return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]); }
    var lower = [], upper = [], i, p;
    for (i = 0; i < pts.length; i++){
      p = pts[i];
      while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0) lower.pop();
      lower.push(p);
    }
    for (i = pts.length-1; i >= 0; i--){
      p = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0) upper.pop();
      upper.push(p);
    }
    var h = lower.slice(0,-1).concat(upper.slice(0,-1));
    return "M" + h.map(function(pt){ return (pt[0]*S) + "," + (pt[1]*S); }).join(" L ") + " Z";
  }

  var brand = getComputedStyle(document.documentElement).getPropertyValue("--red").trim() || "#E81439";

  function makeWordmark(host, opts){
    var S = opts.cell;
    var stage = document.createElement("div");
    stage.className = "wm-stage";
    stage.style.width = (COLS*S) + "px";
    stage.style.height = (ROWS*S) + "px";
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    var outline = document.createElementNS(NS, "path");
    outline.setAttribute("fill", "none");
    outline.setAttribute("stroke", brand);
    outline.setAttribute("stroke-width", Math.max(1.2, S/22));
    svg.appendChild(outline);
    stage.appendChild(svg);
    var spans = LETTERS.map(function(ch){
      var d = document.createElement("div");
      d.className = "wm-letter";
      d.textContent = ch;
      d.setAttribute("aria-hidden", "true");
      d.style.width = S + "px";
      d.style.height = S + "px";
      d.style.fontSize = Math.round(S*0.46) + "px";
      d.style.color = brand;
      stage.appendChild(d);
      return d;
    });
    host.appendChild(stage);
    var wi = 0, cycleTimer, outlineTimer;
    function outlinePath(cfg){
      var all = cfg.extra ? cfg.cells.concat(cfg.extra) : cfg.cells;
      return cfg.hull ? hull(all, S) : boundary(all, S);
    }
    function go(i, instant){
      wi = (i + CONFIGS.length) % CONFIGS.length;
      var cfg = CONFIGS[wi];
      cfg.cells.forEach(function(cell, k){
        spans[k].style.transform = "translate(" + (cell[0]*S) + "px," + (cell[1]*S) + "px)";
      });
      clearTimeout(outlineTimer);
      if (instant || REDUCED){
        outline.setAttribute("d", outlinePath(cfg));
        outline.style.opacity = 1;
        return;
      }
      outline.style.opacity = 0;
      outlineTimer = setTimeout(function(){
        outline.setAttribute("d", outlinePath(cfg));
        outline.style.opacity = 1;
      }, 900);
    }
    function play(){ clearInterval(cycleTimer); cycleTimer = setInterval(function(){ go(wi+1); }, 3200); }
    function stop(){ clearInterval(cycleTimer); }
    go(opts.startFig || 0, true);
    if (!REDUCED){
      stage.addEventListener("mouseenter", stop);
      stage.addEventListener("mouseleave", play);
      play();
    }
    return { go: go, play: play, stop: stop, stage: stage };
  }

  // ── Construcción del header ──
  var header = document.createElement("header");
  header.className = "site-header";
  header.id = "siteHeader";

  var bar = document.createElement("nav");
  bar.className = "site-home";
  bar.id = "top";

  var left = document.createElement("div");
  left.className = "nav-left";
  var center = document.createElement("div");
  center.className = "nav-center";
  center.id = "navClock";
  center.setAttribute("aria-hidden", "true");
  var right = document.createElement("div");
  right.className = "nav-right";

  var isEN = (document.documentElement.lang || "").indexOf("en") === 0;
  var isMobile = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

  // Si la página tiene un nav previo (site-case o site-home residual),
  // mudamos sus links a la barra y lo eliminamos.
  var oldNav = document.querySelector("nav.site-case, nav.site-home");
  if (oldNav){
    var back = oldNav.querySelector(".back");
    var lang = oldNav.querySelector(".lang-switch");
    if (back) left.appendChild(back);
    if (lang) right.appendChild(lang);
    oldNav.parentNode.removeChild(oldNav);
  }

  // Menú (hamburguesa) en TODAS las páginas. "Hablemos" vive solo acá.
  var overlay = document.getElementById("menuOverlay");
  var builtOverlay = false;
  if (!overlay){
    builtOverlay = true;
    var home = isEN ? "index-en.html" : "index.html";
    overlay = document.createElement("div");
    overlay.className = "menu-overlay";
    overlay.id = "menuOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", isEN ? "Navigation menu" : "Menú de navegación");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<nav class="menu-nav"><ul>' +
      '<li><a href="' + home + '">' + (isEN ? "Home" : "Inicio") + '</a></li>' +
      '<li><a href="' + home + '#proyectos">' + "Work" + '</a></li>' +
      '<li><a href="' + home + '#experiencia">' + (isEN ? "Experience" : "Experiencia") + '</a></li>' +
      '<li><a href="' + home + '#contacto">' + (isEN ? "Let's talk" : "Hablemos") + '</a></li>' +
      '</ul></nav>';
    document.body.appendChild(overlay);
  }

  var toggle = document.createElement("button");
  toggle.className = "menu-toggle";
  toggle.id = "menuToggle";
  toggle.setAttribute("aria-label", isEN ? "Open menu" : "Abrir menú");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "menuOverlay");
  toggle.textContent = "+";
  right.appendChild(toggle);

  // Cableado del menú SOLO si lo creamos acá (en la home lo maneja el inline).
  if (builtOverlay){
    function closeMenu(){
      overlay.classList.remove("is-open");
      toggle.classList.remove("open");
      toggle.textContent = "+";
      toggle.setAttribute("aria-expanded", "false");
      overlay.setAttribute("aria-hidden", "true");
    }
    toggle.addEventListener("click", function(){
      var open = overlay.classList.toggle("is-open");
      toggle.classList.toggle("open", open);
      toggle.textContent = open ? "×" : "+";
      toggle.setAttribute("aria-expanded", String(open));
      overlay.setAttribute("aria-hidden", String(!open));
      if (open){ var a = overlay.querySelector("a"); if (a) a.focus(); }
    });
    overlay.addEventListener("click", function(e){
      if (e.target.closest && e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && overlay.classList.contains("is-open")){ closeMenu(); toggle.focus(); }
    });
  }

  bar.appendChild(left);
  bar.appendChild(center);
  bar.appendChild(right);
  header.appendChild(bar);

  var wmBox = document.createElement("div");
  wmBox.className = "header-wm";
  wmBox.id = "headerWm";
  var wmHost = document.createElement("div");
  wmHost.className = "wm-host";
  wmHost.id = "wmHero";
  wmHost.setAttribute("role", "img");
  wmHost.setAttribute("aria-label", "Paula Azcue");
  wmBox.appendChild(wmHost);
  header.appendChild(wmBox);

  document.body.insertBefore(header, document.body.firstChild);

  // Reloj
  function tick(){
    var d = new Date();
    var hh = String(d.getHours()).padStart(2,"0");
    var mm = String(d.getMinutes()).padStart(2,"0");
    var ss = String(d.getSeconds()).padStart(2,"0");
    center.textContent = hh + ":" + mm + ":" + ss + " · BUENOS AIRES";
  }
  tick();
  setInterval(tick, 1000);

  // Wordmark + colapso (header fixed, padding del body constante = sin titileo)
  var BAR = 52, GAP = 8, TAIL = isMobile ? 12 : 20;
  var vw = window.innerWidth || 400;
  var S = isMobile
    ? Math.min(20, Math.floor((vw - 32) / COLS))
    : Math.min(30, Math.floor(Math.min(vw - 40, 400) / COLS));
  var wm = makeWordmark(wmHost, {cell: S, startFig: 1});
  var expandedH = GAP + (ROWS * S) + TAIL;
  wmBox.style.height = expandedH + "px";
  document.body.style.paddingTop = (BAR + expandedH) + "px";

  var collapsed = false;
  var idleTimer;
  function onScroll(){
    var y = window.scrollY;

    // Mientras se scrollea, el wordmark NO se anima (se congela). Vuelve a
    // animarse solo cuando la página queda quieta y está expandido (arriba).
    wm.stop();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function(){
      if (!collapsed && !REDUCED) wm.play();
    }, 280);

    if (!collapsed && y > 16){
      collapsed = true;
      header.classList.add("collapsed");
      wm.stop();                 // corta cualquier ciclo pendiente
      wm.go(0, true);            // instantáneo: se ordena en una línea sin "caer"
      wmBox.style.height = "0px";
      // desktop: el wordmark queda fijo en una línea dentro de la barra.
      // mobile: se oculta (wmBox height 0 + overflow hidden) para no pisar la barra.
      if (!isMobile){
        wm.stage.style.transform = "translateY(" + (BAR/2 - (BAR + GAP) - 1.5 * S) + "px)";
      }
    } else if (collapsed && y < 6){
      collapsed = false;
      header.classList.remove("collapsed");
      wmBox.style.height = expandedH + "px";
      wm.stage.style.transform = "translateY(0)";
      // el morph se reanuda por el idleTimer cuando dejás de scrollear
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // si la página carga ya scrolleada
})();
