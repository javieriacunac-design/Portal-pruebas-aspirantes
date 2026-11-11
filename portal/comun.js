"use strict";
/* Utilidades comunes del portal INDIMON */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const API = (typeof window.INDIMON_PORTAL_API === "string" && /^https:\/\/script\.google(usercontent)?\.com\//.test(window.INDIMON_PORTAL_API)) ? window.INDIMON_PORTAL_API
  : (window.INDIMON_PORTAL_API_LOCAL || "");
async function api(a, datos, ms) {
  if (!API) throw new Error("El portal no está configurado (archivo config.js).");
  const cuerpo = JSON.stringify(Object.assign({ a }, datos || {}));
  const r = await Promise.race([
    fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: cuerpo, redirect: "follow" }),
    new Promise((_, rej) => setTimeout(() => rej(new Error("La conexión tardó demasiado. Intente de nuevo.")), ms || 30000))
  ]);
  let j; try { j = await r.json(); } catch (e) { throw new Error("Respuesta inválida del servidor."); }
  if (!j.ok) { const e = new Error(j.error || "Error"); e.servidor = true; throw e; }
  return j.data;
}
function fecha(v, conHora) {
  if (!v) return "—"; const d = new Date(v); if (isNaN(d)) return esc(v);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) + (conHora ? " " + d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "");
}
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function barajar(n, semilla) { const r = mulberry(hashStr(semilla)), a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
function modal(html, ancha) {
  let m = $("#modalGen"); if (!m) { m = document.createElement("div"); m.id = "modalGen"; m.className = "modal"; m.innerHTML = '<div class="caja"></div>'; document.body.appendChild(m); m.addEventListener("click", e => { if (e.target === m) cerrarModal(); }); }
  $(".caja", m).className = "caja" + (ancha ? " ancha" : ""); $(".caja", m).innerHTML = html; m.classList.add("ver"); return $(".caja", m);
}
function cerrarModal() { const m = $("#modalGen"); if (m) m.classList.remove("ver"); }
function confirmar(titulo, texto, si, etiqueta) {
  const c = modal(`<h2>${esc(titulo)}</h2><p>${esc(texto)}</p><div class="fila" style="justify-content:flex-end"><button class="btn sec" id="cfNo">Volver</button><button class="btn" id="cfSi">${esc(etiqueta || "Confirmar")}</button></div>`);
  $("#cfNo", c).onclick = cerrarModal; $("#cfSi", c).onclick = () => { cerrarModal(); si(); };
}
async function copiar(texto, el) {
  try { await navigator.clipboard.writeText(texto); if (el) { const t = el.textContent; el.textContent = "Copiado ✓"; setTimeout(() => el.textContent = t, 1800); } return true; }
  catch (e) { prompt("Copie el texto:", texto); return false; }
}
