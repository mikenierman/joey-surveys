/**
 * @jest-environment jsdom
 */
import { pendingSyncCount, listPendingVisits, submitVisit } from './data';

describe('offline visit queue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('submitVisit queues when no supabase', async () => {
    const { visit, synced } = await submitVisit({
      store_number: '99901',
      cycle_key: '2099-Q1',
      status: 'submitted',
      survey_data: {},
      photo_urls: {},
    });
    expect(synced).toBe(false);
    expect(visit._pending).toBe(true);
    expect(visit.status).toBe('pending_sync');
    expect(pendingSyncCount()).toBe(1);
    expect(listPendingVisits()).toHaveLength(1);
  });

  test('duplicate cycle throws', async () => {
    await submitVisit({
      store_number: '99902',
      cycle_key: '2099-Q1',
      survey_data: {},
      photo_urls: {},
    });
    await expect(
      submitVisit({
        store_number: '99902',
        cycle_key: '2099-Q1',
        survey_data: {},
        photo_urls: {},
      })
    ).rejects.toThrow(/already has a visit/i);
  });
});
