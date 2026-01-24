(() => {
  // If not authorized, redirect to index.html
  const ok = sessionStorage.getItem("lw_access") === "ok";
  if (ok) return;

  // Detect GitHub Pages project base: /<repo>/
  const parts = (location.pathname || "/").split("/").filter(Boolean);
  const base = parts.length ? `/${parts[0]}/` : "/";

  // Avoid infinite loop if already on index.html
  const path = location.pathname || "";
  if (path.endsWith("/index.html") || path === base) return;

  window.location.replace(base + "index.html");
})();
