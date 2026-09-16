/**
 * Multi-program / survey-builder scaffold.
 * Default JOEY×Circle K config; other programs can load JSON later.
 */

export const DEFAULT_PROGRAM_ID = 'joey-circlek';

export const DEFAULT_PROGRAM = {
  id: DEFAULT_PROGRAM_ID,
  name: 'JOEY × Circle K Merchandising',
  brand: 'JOEY',
  client: 'joeypouches.com',
  chain: 'Circle K',
  version: 1,
  cycle: 'quarterly',
  media: {
    sellSheet: '/media/joey/sell-sheet.svg',
    pogBase: '/media/joey/pog',
  },
  geofence: {
    softRadiusM: 500,
    hardBlockSubmit: false,
    requireExceptionNoteOnMismatch: true,
  },
  roles: {
    clientDomains: ['joeypouches.com'],
    adminEmails: ['mike@direct2retailers.com'],
  },
};

let cached = null;

export async function loadProgramConfig(programId = DEFAULT_PROGRAM_ID) {
  if (cached && cached.id === programId) return cached;
  try {
    const res = await fetch(`/data/programs/${programId}.json`, { cache: 'no-store' });
    if (res.ok) {
      cached = { ...DEFAULT_PROGRAM, ...(await res.json()), id: programId };
      return cached;
    }
  } catch {
    /* fall through */
  }
  cached = { ...DEFAULT_PROGRAM, id: programId };
  return cached;
}

export function getCachedProgram() {
  return cached || DEFAULT_PROGRAM;
}

export function programAllowsClientEmail(email, program = getCachedProgram()) {
  const e = (email || '').toLowerCase();
  const domains = program.roles?.clientDomains || [];
  return domains.some((d) => e.endsWith(`@${d}`));
}
