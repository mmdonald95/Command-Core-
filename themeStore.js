/**
 * Theme Store — persists custom accent colour in localStorage
 * and injects CSS variables into :root.
 */

const STORAGE_KEY = "ppdms_accent_color";

export const ACCENT_PRESETS = [
  { label: "Orange (Default)", value: "#f97316", hsl: "24 95% 53%" },
  { label: "Blue",             value: "#3b82f6", hsl: "217 91% 60%" },
  { label: "Emerald",          value: "#10b981", hsl: "160 84% 39%" },
  { label: "Violet",           value: "#8b5cf6", hsl: "258 90% 66%" },
  { label: "Rose",             value: "#f43f5e", hsl: "350 89% 60%" },
  { label: "Amber",            value: "#f59e0b", hsl: "38 92% 50%" },
  { label: "Cyan",             value: "#06b6d4", hsl: "192 91% 44%" },
  { label: "Slate",            value: "#64748b", hsl: "215 16% 47%" },
];

export function getSavedAccent() {
  return localStorage.getItem(STORAGE_KEY) || ACCENT_PRESETS[0].value;
}

export function applyAccent(hexValue) {
  const preset = ACCENT_PRESETS.find(p => p.value === hexValue) || ACCENT_PRESETS[0];
  document.documentElement.style.setProperty("--accent-hex", preset.value);
  document.documentElement.style.setProperty("--chart-1", preset.hsl);
  // Recolour the primary action buttons used throughout the app
  document.documentElement.style.setProperty("--app-accent", preset.value);
  localStorage.setItem(STORAGE_KEY, preset.value);
}

/** Call once on app boot to restore saved preference. */
export function initTheme() {
  applyAccent(getSavedAccent());
}