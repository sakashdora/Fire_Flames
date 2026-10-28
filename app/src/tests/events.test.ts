import test from 'node:test';
import assert from 'node:assert/strict';

// Test Event Catalogue Invariants (E01 & Client Brief)
import { EVENT_CATALOGUE } from '../domain/events.ts';

test('E-Fest catalogue preserves documented capacities, rosters and payment gates', () => {
  const expected = {
    'ipl-auction': [null, 2, 4, 800000],
    'brand-war': [null, 2, 3, 450000],
    'e-trivia': [null, 2, 4, 450000],
    'treasure-hunt': [null, 2, 4, 700000],
    'srusti-bazar': [10, undefined, undefined, 300000],
    'srusti-exhibition': [10, undefined, undefined, 900000],
  };
  for (const [slug, values] of Object.entries(expected)) {
    const event = EVENT_CATALOGUE.find(e => e.slug === slug)!;
    assert.deepEqual([event.capacity, event.teamMin, event.teamMax, event.prizePoolPaise], values, slug);
    assert.ok(event.gates.includes('official_payment_profile'));
    assert.ok(event.priceOptions.every(option => !option.enabled), 'No payment without official QR');
  }
});

test('E01: BGMI Event Catalogue matches confirmed client brief', () => {
  const bgmi = EVENT_CATALOGUE.find(e => e.slug === 'bgmi');
  assert.ok(bgmi, 'BGMI event must exist with slug bgmi');

  // Dates
  assert.deepEqual(bgmi.dates, ['2026-11-13', '2026-11-14'], 'BGMI dates must be 13 and 14 Nov 2026');
  assert.equal(bgmi.capacity, 24, 'BGMI capacity must be 24 teams');
  assert.equal(bgmi.capacityUnit, 'team', 'Capacity unit must be team');
  
  // Prize Pool
  assert.equal(bgmi.prizePoolPaise, 1000000, 'Prize pool must be INR 10,000 (1,000,000 paise)');
  
  // Roster invariants
  assert.equal(bgmi.startersRequired, 4, '4 starters required');
  assert.equal(bgmi.substituteSlots, 1, '1 substitute slot');
  assert.equal(bgmi.substituteRequired, null, 'Substitute mandatory status must be explicitly pending/null');
  assert.equal(bgmi.iglRequired, 1, '1 IGL required');
  assert.equal(bgmi.queryPhone, '8260555312', 'Contact query phone must be 8260555312');

  // BGIS 2026 Placement Chart
  assert.ok(bgmi.scoringChart, 'Scoring chart must be present');
  assert.equal(bgmi.scoringChart.length, 16, 'Chart must cover placements 1 to 16');
  
  const expectedPoints = [10, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  bgmi.scoringChart.forEach((item, idx) => {
    assert.equal(item.place, idx + 1, `Place should be ${idx + 1}`);
    assert.equal(item.points, expectedPoints[idx], `Place ${item.place} points should be ${expectedPoints[idx]}`);
  });

  // Entry fee pending
  assert.equal(bgmi.priceOptions[0].amount_paise, null, 'BGMI entry fee must be null (pending)');
  assert.equal(bgmi.priceOptions[0].enabled, false, 'Checkout must be disabled');
});

test('Free Fire details remain unconfirmed and independent', () => {
  const ff = EVENT_CATALOGUE.find(e => e.slug === 'free-fire');
  assert.ok(ff, 'Free Fire event exists');
  assert.equal(ff.dates.length, 0, 'Free Fire dates remain unconfirmed');
  assert.equal(ff.prizePoolPaise, undefined, 'Free Fire prize pool must not be inferred by subtraction');
});
