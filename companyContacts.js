function normalizeCode(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizeEmail(value) {
  const email = String(value || '').trim();
  return email || null;
}

export function getCompanyDefaultContacts(company) {
  const code = normalizeCode(company?.code);
  const terminology = company?.custom_terminology || {};

  const configured = {
    managerEmail: normalizeEmail(terminology.manager_email),
    officeManagerEmail: normalizeEmail(terminology.office_manager_email),
  };

  if (configured.managerEmail || configured.officeManagerEmail) {
    return configured;
  }

  if (code === 'PPD' || code === 'PPDMS') {
    return {
      managerEmail: 'mgambino@ppdms.com',
      officeManagerEmail: 'msmith@ppdms.com',
    };
  }

  return {
    managerEmail: null,
    officeManagerEmail: null,
  };
}

export function getCompanyEmailOptions(company) {
  const defaults = getCompanyDefaultContacts(company);
  const options = [];
  const seen = new Set();

  const pushOption = (label, email) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    options.push({ label, email: normalized });
  };

  pushOption('Manager', defaults.managerEmail);
  pushOption('Office Manager', defaults.officeManagerEmail);

  return options;
}

export function getPreferredCompanyEmail(company, preferredRole = 'manager') {
  const defaults = getCompanyDefaultContacts(company);

  if (preferredRole === 'office') {
    return defaults.officeManagerEmail || defaults.managerEmail || '';
  }

  return defaults.managerEmail || defaults.officeManagerEmail || '';
}
