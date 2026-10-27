import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { station_id, event_id, asset_code, config_version, inspector_id, result, reason } = body;

    if (!station_id || !asset_code || !config_version || !inspector_id) {
      return NextResponse.json({ error: 'Missing required hardware inspection fields' }, { status: 422 });
    }

    return NextResponse.json({
      status: 'signed_off',
      station_id,
      asset_code,
      config_version,
      result: result || 'passed',
      inspector_id,
      checked_at: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
