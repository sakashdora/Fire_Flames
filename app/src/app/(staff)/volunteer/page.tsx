'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, QrCode } from 'lucide-react';
import { api, type ApiResult } from '@/lib/client/api';
import { StaffShell } from '@/components/staff/StaffShell';
import { ApiErrorNotice, Notice } from '@/components/ui/Notice';

interface Duty { duty_id: string; event_name: string; session_id: string; session: string; station_id: string; station: string; starts_at: string; ends_at: string; active: boolean }

export default function VolunteerDesk() {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [status, setStatus] = useState<ApiResult | null>(null);
  const [dutyId, setDutyId] = useState('');
  const [token, setToken] = useState('');
  const [scan, setScan] = useState<ApiResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const supportsCamera = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  useEffect(() => {
    api<Duty[]>('/api/staff/duties').then(res => {
      setStatus(res);
      if (res.ok && res.data) { setDuties(res.data); setDutyId(res.data.find(d => d.active)?.duty_id ?? ''); }
    });
  }, []);

  const duty = duties.find(d => d.duty_id === dutyId);
  const submit = async (code: string) => {
    if (!duty || !code.trim()) return;
    setBusy(true); setScan(null);
    const res = await api('/api/volunteer/scan', { body: { token: code, session_id: duty.session_id, station_id: duty.station_id } });
    setScan(res); setBusy(false); setToken('');
  };

  useEffect(() => {
    if (!camera || !video.current) return;
    let stop = false; let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.current!.srcObject = stream; await video.current!.play();
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        while (!stop) {
          const codes = await detector.detect(video.current!).catch(() => []);
          if (codes[0]?.rawValue) { setCamera(false); submit(codes[0].rawValue); break; }
          await new Promise(r => setTimeout(r, 250));
        }
      } catch { setCamera(false); setScan({ ok: false, status: 0, error: { code: 'camera', message: 'Camera unavailable. Type the pass code instead.' } }); }
    })();
    return () => { stop = true; stream?.getTracks().forEach(t => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  return <StaffShell badge="VOLUNTEER DESK" title="Check-in scanner" status={status}
    intro="Scans only work during your assigned shift at your assigned station. A pass is checked in once per session; repeats show the original time.">
    {duties.length === 0 ? <Notice>You have no current duties. An event admin assigns stations and shifts.</Notice> : <div className="ws-grid">
      <div className="ws-card stack">
        <label className="field">Your duty
          <select value={dutyId} onChange={e => setDutyId(e.target.value)}>
            <option value="">Choose duty</option>
            {duties.map(d => <option key={d.duty_id} value={d.duty_id}>{d.event_name} · {d.session} · {d.station}{d.active ? '' : ' (not active now)'}</option>)}
          </select>
        </label>
        {duty && !duty.active && <Notice>This shift runs {new Date(duty.starts_at).toLocaleString('en-IN')} – {new Date(duty.ends_at).toLocaleTimeString('en-IN')}. Scans are refused outside it.</Notice>}
        <form className="row" onSubmit={e => { e.preventDefault(); submit(token); }}>
          <label className="field">Pass code<input value={token} onChange={e => setToken(e.target.value)} autoComplete="off" placeholder="Scan with a reader or type" /></label>
          <button className="btn-primary btn-small" style={{ flex: '0 0 auto' }} disabled={busy || !duty}><QrCode size={16} /> {busy ? 'Checking…' : 'Check in'}</button>
        </form>
        {supportsCamera && <button type="button" className="btn-secondary btn-small" disabled={!duty} onClick={() => setCamera(c => !c)}><Camera size={16} /> {camera ? 'Stop camera' : 'Scan with camera'}</button>}
        {camera && <video ref={video} muted playsInline style={{ width: '100%', borderRadius: 4, background: '#000' }} />}
      </div>
      <div className="ws-card">
        <h2>Result</h2>
        {!scan ? <p style={{ color: 'var(--text-muted)' }}>Waiting for a scan.</p>
          : scan.ok ? <Notice tone={scan.data.status === 'duplicate' ? 'info' : 'ok'}>
              <strong>{scan.data.status === 'duplicate' ? 'Already checked in' : 'Checked in'}</strong>: {scan.data.participant} · {scan.data.event}<br />
              {new Date(scan.data.checked_in_at).toLocaleTimeString('en-IN')} · ref {scan.data.support_reference}
            </Notice>
          : <ApiErrorNotice result={scan} />}
      </div>
    </div>}
  </StaffShell>;
}
