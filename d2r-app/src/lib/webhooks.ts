import path from 'path';
import {
  dataPath,
  ensureDir,
  listJsonFiles,
  readJsonFile,
  writeJsonFile,
} from '@/lib/store';

export type WebhookEventRecord = {
  id: string;
  topic: string;
  shopDomain: string | null;
  receivedAt: string;
  payload: unknown;
  handled: boolean;
  note?: string;
};

const eventsDir = () => dataPath('webhook-events');
const indexPath = () => dataPath('webhook-events', '_index.json');

type EventIndex = {
  byWebhookId: Record<string, string>;
  count: number;
  lastReceivedAt: string | null;
};

function loadIndex(): EventIndex {
  return readJsonFile<EventIndex>(indexPath(), {
    byWebhookId: {},
    count: 0,
    lastReceivedAt: null,
  });
}

function saveIndex(index: EventIndex) {
  writeJsonFile(indexPath(), index);
}

export function findWebhookEvent(webhookId: string): WebhookEventRecord | null {
  const index = loadIndex();
  const file = index.byWebhookId[webhookId];
  if (!file) return null;
  return readJsonFile<WebhookEventRecord | null>(file, null);
}

export function persistWebhookEvent(record: WebhookEventRecord): {
  stored: boolean;
  duplicate: boolean;
} {
  const index = loadIndex();
  if (index.byWebhookId[record.id]) {
    return { stored: false, duplicate: true };
  }
  ensureDir(eventsDir());
  const safeTopic = record.topic.replace(/[^a-z0-9/_-]/gi, '_').replace(/\//g, '-');
  const file = path.join(eventsDir(), `${record.receivedAt.replace(/[:.]/g, '-')}_${safeTopic}_${record.id}.json`);
  writeJsonFile(file, record);
  index.byWebhookId[record.id] = file;
  index.count += 1;
  index.lastReceivedAt = record.receivedAt;
  saveIndex(index);
  return { stored: true, duplicate: false };
}

export function getWebhookStats() {
  const index = loadIndex();
  const files = listJsonFiles(eventsDir()).filter((f) => !f.endsWith('_index.json'));
  return {
    count: index.count || files.length,
    lastReceivedAt: index.lastReceivedAt,
    files: files.length,
  };
}

export function listRecentWebhookEvents(limit = 20): WebhookEventRecord[] {
  const files = listJsonFiles(eventsDir())
    .filter((f) => !f.endsWith('_index.json'))
    .sort()
    .reverse()
    .slice(0, limit);
  return files
    .map((f) => readJsonFile<WebhookEventRecord | null>(f, null))
    .filter((r): r is WebhookEventRecord => Boolean(r));
}

/** Topic-specific side effects (local twin only — no Shopify writes). */
export function handleWebhookTopic(topic: string): {
  handled: boolean;
  note: string;
} {
  switch (topic) {
    case 'inventory_levels/update':
      return {
        handled: true,
        note: 'Queued inventory level for next local sync reconcile (no Shopify write).',
      };
    case 'products/update':
    case 'products/create':
      return {
        handled: true,
        note: 'Product catalog change recorded; refresh via POST /api/shopify/sync.',
      };
    case 'orders/create':
    case 'orders/updated':
      return {
        handled: true,
        note: 'Order signal recorded for twin orders scaffold.',
      };
    case 'app/uninstalled':
      return {
        handled: true,
        note: 'App uninstall recorded — clear tokens in env before next sync.',
      };
    default:
      return { handled: false, note: `Unhandled topic ${topic}; raw event stored.` };
  }
}
