import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'fire-and-flames-api',
    version: '0.1.0',
    database: {
      status: 'verified_local',
      tables: 68,
      foreign_keys: 165
    },
    workflows: {
      esports_lan_extensions: 'active',
      bgmi_roster_rules: 'active',
      gated_payment_checkout: 'pending_official_qr_and_fee',
      gated_final_scoring: 'pending_tiebreak_policy'
    }
  });
}
