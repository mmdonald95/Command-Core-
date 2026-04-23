export const COMPANY_THEME_PRESETS = [
  {
    id: 'blue-slate',
    name: 'Blue Slate',
    description: 'Clean blue with a dark slate workspace.',
    primary: '#2563eb',
    primaryDark: '#0f172a',
    soft: '#dbeafe',
    softText: '#1d4ed8',
    border: '#93c5fd',
    accent: '#e2e8f0',
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep green with a field-ready feel.',
    primary: '#15803d',
    primaryDark: '#14532d',
    soft: '#dcfce7',
    softText: '#166534',
    border: '#86efac',
    accent: '#ecfccb',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and copper accents.',
    primary: '#ea580c',
    primaryDark: '#7c2d12',
    soft: '#ffedd5',
    softText: '#c2410c',
    border: '#fdba74',
    accent: '#fef3c7',
  },
  {
    id: 'steel',
    name: 'Steel',
    description: 'Industrial gray with sharp blue highlights.',
    primary: '#475569',
    primaryDark: '#111827',
    soft: '#e2e8f0',
    softText: '#334155',
    border: '#cbd5e1',
    accent: '#dbeafe',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    description: 'Bold red for a strong branded look.',
    primary: '#b91c1c',
    primaryDark: '#450a0a',
    soft: '#fee2e2',
    softText: '#991b1b',
    border: '#fca5a5',
    accent: '#fef2f2',
  },
];

export const DEFAULT_COMPANY_THEME_ID = 'blue-slate';

export function getCompanyThemePreset(themeId) {
  return (
    COMPANY_THEME_PRESETS.find((theme) => theme.id === themeId) ||
    COMPANY_THEME_PRESETS.find((theme) => theme.id === DEFAULT_COMPANY_THEME_ID) ||
    COMPANY_THEME_PRESETS[0]
  );
}

export function getCompanyThemeId(company) {
  const rawTheme =
    company?.custom_terminology?.app_theme ||
    company?.custom_terminology?.theme_id ||
    company?.theme_id ||
    DEFAULT_COMPANY_THEME_ID;

  return String(rawTheme || DEFAULT_COMPANY_THEME_ID);
}

export function getCompanyTheme(company) {
  return getCompanyThemePreset(getCompanyThemeId(company));
}

export function applyCompanyThemeToDocument(theme) {
  const resolvedTheme = theme || getCompanyThemePreset(DEFAULT_COMPANY_THEME_ID);

  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--company-primary', resolvedTheme.primary);
  root.style.setProperty('--company-primary-dark', resolvedTheme.primaryDark);
  root.style.setProperty('--company-primary-soft', resolvedTheme.soft);
  root.style.setProperty('--company-primary-soft-text', resolvedTheme.softText);
  root.style.setProperty('--company-primary-border', resolvedTheme.border);
  root.style.setProperty('--company-accent', resolvedTheme.accent);
}
