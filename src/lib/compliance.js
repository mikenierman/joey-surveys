/**
 * Compliance score + issue helpers built on visitFlags / survey_data.
 */

const FLAG_PENALTIES = {
  NOT_SET: 35,
  OOS_NO_INVENTORY: 15,
  NOT_REPLENISHED: 10,
  UNCORRECTED: 20,
  POS_DECLINED: 15,
  PRICE_NOT_VISIBLE: 8,
  PRICE_ISSUE: 10,
  LOCATION_MISMATCH: 12,
  GPS_UNAVAILABLE: 8,
  STORE_CLOSED: 0,
  STORE_INACCESSIBLE: 0,
  VISIT_REFUSED: 5,
};

export function complianceScoreFromFlags(flags = [], survey = {}) {
  let score = 100;
  const unique = [...new Set(flags)];
  for (const f of unique) {
    score -= FLAG_PENALTIES[f] ?? 5;
  }
  if (survey.present === 'yes' && survey.shelf === 'well') score += 0;
  if (survey.educated === 'yes') score = Math.min(100, score + 2);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function complianceBand(score) {
  if (score >= 85) return { key: 'good', label: 'Good', tone: 'ok' };
  if (score >= 60) return { key: 'fair', label: 'Fair', tone: 'warn' };
  return { key: 'poor', label: 'Needs work', tone: 'red' };
}

export function scoreVisit(visit) {
  const flags = visit.flags || [];
  const survey = visit.survey_data || {};
  const score = complianceScoreFromFlags(flags, survey);
  return { score, band: complianceBand(score), flags };
}

/**
 * Open issues from visits that need follow-up (local/portal workflow).
 */
export function buildIssueQueue(visits = []) {
  return (visits || [])
    .filter((v) => {
      const status = v.status || 'submitted';
      if (['qualified', 'rejected'].includes(status)) return false;
      return (
        v.followup ||
        (v.flags || []).some((f) =>
          ['NOT_SET', 'UNCORRECTED', 'POS_DECLINED', 'OOS_NO_INVENTORY', 'PRICE_ISSUE'].includes(f)
        ) ||
        status === 'in_review'
      );
    })
    .map((v) => {
      const { score, band } = scoreVisit(v);
      return {
        id: v.id,
        store_number: v.store_number,
        rep_name: v.rep_name,
        status: v.issue_status || (v.status === 'in_review' ? 'in_progress' : 'open'),
        flags: v.flags || [],
        followNote: v.survey_data?.followNote || '',
        score,
        band,
        assignee: v.issue_assignee || null,
        visit: v,
      };
    })
    .sort((a, b) => a.score - b.score);
}

export const ISSUE_STATUSES = ['open', 'in_progress', 'closed'];
