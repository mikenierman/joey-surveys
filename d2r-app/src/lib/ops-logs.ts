/**
 * Install + automation ops logs for the offline twin.
 *
 * Runtime writes (gitignored):
 *   data/runtime/ops-events.jsonl   — append-only structured event stream
 *   data/runtime/install-logs.json  — rolling install/auth/scope records
 *   data/runtime/automation-runs.json — rolling automation run records
 *
 * Seed (committed):
 *   data/seed/shopify-install-logs.json — offline sample for admin UI
 *
 * Never store tokens or webhook secrets in these files.
 */
import path from 'path';
import {
  appendJsonLine,
  dataPath,
  ensureDir,
  newId,
  readJsonFile,
  readSeedStore,
  writeJsonFile,
} from '@/lib/store';

export type OpsEventKind =
  | 'webhook'
  | 'webhook_reject'
  | 'install'
  | 'auth'
  | 'scope_health'
  | 'automation';

export type OpsEventStatus =
  | 'ok'
  | 'error'
  | 'skipped'
  | 'offline'
  | 'rejected'
  | 'duplicate';

export type OpsEvent = {
  id: string;
  kind: OpsEventKind;
  status: OpsEventStatus;
  timestamp: string;
  shopDomain?: string | null;
  topic?: string;
  job?: string;
  scopesSummary?: string;
  message?: string;
  meta?: Record<string, unknown>;
};

export type InstallLogRecord = {
  id: string;
  timestamp: string;
  shopDomain: string;
  event: 'install' | 'uninstall' | 'auth' | 'scope_health';
  status: OpsEventStatus;
  scopesSummary: string;
  note?: string;
};

export type AutomationRunRecord = {
  id: string;
  timestamp: string;
  job: 'brand-levels-refresh' | 'inventory-sync';
  status: OpsEventStatus;
  shopDomain?: string | null;
  message: string;
  meta?: Record<string, unknown>;
};

const RUNTIME = 'runtime';
const eventsPath = () => dataPath(RUNTIME, 'ops-events.jsonl');
const installLogsPath = () => dataPath(RUNTIME, 'install-logs.json');
const automationRunsPath = () => dataPath(RUNTIME, 'automation-runs.json');

const MAX_ROLLING = 200;

function trimRolling<T>(items: T[], max = MAX_ROLLING): T[] {
  if (items.length <= max) return items;
  return items.slice(items.length - max);
}

/** Append one structured line to data/runtime/ops-events.jsonl (gitignored). */
export function appendOpsEvent(
  partial: Omit<OpsEvent, 'id' | 'timestamp'> & {
    id?: string;
    timestamp?: string;
  }
): OpsEvent {
  const event: OpsEvent = {
    id: partial.id || newId('ops'),
    timestamp: partial.timestamp || new Date().toISOString(),
    kind: partial.kind,
    status: partial.status,
    shopDomain: partial.shopDomain ?? null,
    topic: partial.topic,
    job: partial.job,
    scopesSummary: partial.scopesSummary,
    message: partial.message,
    meta: partial.meta,
  };
  ensureDir(path.dirname(eventsPath()));
  // Strip undefined keys for compact JSONL
  const line = Object.fromEntries(
    Object.entries(event).filter(([, v]) => v !== undefined)
  );
  appendJsonLine(eventsPath(), line);
  return event;
}

export function recordInstallLog(
  input: Omit<InstallLogRecord, 'id' | 'timestamp'> & {
    id?: string;
    timestamp?: string;
  }
): InstallLogRecord {
  const record: InstallLogRecord = {
    id: input.id || newId('install'),
    timestamp: input.timestamp || new Date().toISOString(),
    shopDomain: input.shopDomain,
    event: input.event,
    status: input.status,
    scopesSummary: input.scopesSummary,
    note: input.note,
  };
  const existing = readJsonFile<{ logs: InstallLogRecord[] }>(installLogsPath(), {
    logs: [],
  });
  existing.logs = trimRolling([...existing.logs, record]);
  writeJsonFile(installLogsPath(), existing);

  appendOpsEvent({
    kind:
      input.event === 'scope_health'
        ? 'scope_health'
        : input.event === 'auth'
          ? 'auth'
          : 'install',
    status: record.status,
    shopDomain: record.shopDomain,
    scopesSummary: record.scopesSummary,
    message: record.note || `${record.event} ${record.status}`,
    meta: { installEvent: record.event },
  });

  return record;
}

export function recordAutomationRun(
  input: Omit<AutomationRunRecord, 'id' | 'timestamp'> & {
    id?: string;
    timestamp?: string;
  }
): AutomationRunRecord {
  const record: AutomationRunRecord = {
    id: input.id || newId('auto'),
    timestamp: input.timestamp || new Date().toISOString(),
    job: input.job,
    status: input.status,
    shopDomain: input.shopDomain ?? null,
    message: input.message,
    meta: input.meta,
  };
  const existing = readJsonFile<{ runs: AutomationRunRecord[] }>(
    automationRunsPath(),
    { runs: [] }
  );
  existing.runs = trimRolling([...existing.runs, record]);
  writeJsonFile(automationRunsPath(), existing);

  appendOpsEvent({
    kind: 'automation',
    status: record.status,
    shopDomain: record.shopDomain,
    job: record.job,
    message: record.message,
    meta: record.meta,
  });

  return record;
}

type SeedInstallFile = {
  meta?: { source?: string; note?: string; capturedAt?: string };
  logs?: InstallLogRecord[];
};

/** Merge seed samples + runtime install logs (newest first). */
export function listInstallLogs(limit = 50): InstallLogRecord[] {
  const seed = readSeedStore<SeedInstallFile>('shopify-install-logs.json', {
    logs: [],
  });
  const runtime = readJsonFile<{ logs: InstallLogRecord[] }>(installLogsPath(), {
    logs: [],
  });
  const merged = [...(seed.logs || []), ...(runtime.logs || [])];
  return merged
    .slice()
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
    .slice(0, limit);
}

/** Runtime automation runs only (newest first). */
export function listAutomationRuns(limit = 50): AutomationRunRecord[] {
  const runtime = readJsonFile<{ runs: AutomationRunRecord[] }>(
    automationRunsPath(),
    { runs: [] }
  );
  return (runtime.runs || [])
    .slice()
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
    .slice(0, limit);
}

/** Combined feed for admin Shopify page (install + automation). */
export function listRecentOpsFeed(limit = 40): Array<
  | { type: 'install'; record: InstallLogRecord }
  | { type: 'automation'; record: AutomationRunRecord }
> {
  const installs = listInstallLogs(limit).map((record) => ({
    type: 'install' as const,
    record,
  }));
  const autos = listAutomationRuns(limit).map((record) => ({
    type: 'automation' as const,
    record,
  }));
  return [...installs, ...autos]
    .sort((a, b) =>
      String(b.record.timestamp).localeCompare(String(a.record.timestamp))
    )
    .slice(0, limit);
}

export function getOpsLogPaths() {
  return {
    eventsJsonl: 'data/runtime/ops-events.jsonl',
    installLogs: 'data/runtime/install-logs.json',
    automationRuns: 'data/runtime/automation-runs.json',
    webhookEvents: 'data/webhook-events/',
    syncSnapshots: 'data/sync/',
    seedInstallLogs: 'data/seed/shopify-install-logs.json',
  };
}
