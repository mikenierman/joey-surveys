/**
 * @jest-environment jsdom
 */
import { appendAuditEvent, readAuditEvents, auditLogin } from './audit';

describe('audit', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('append and read events', () => {
    appendAuditEvent({ type: 'test', actor: 'a@b.com' });
    const events = readAuditEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('test');
    expect(events[0].id).toMatch(/^aud-/);
  });

  test('auditLogin records role', () => {
    auditLogin({ email: 'mike@direct2retailers.com', role: 'admin' });
    expect(readAuditEvents()[0]).toMatchObject({
      type: 'login',
      actor: 'mike@direct2retailers.com',
      role: 'admin',
    });
  });
});
