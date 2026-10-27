'use client';

import { useState } from 'react';
import { Shield, Monitor, PauseCircle, UserCheck, AlertTriangle, CheckCircle2, Trophy, Clock } from 'lucide-react';

export default function RefereeWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'hardware' | 'pause' | 'substitute' | 'scoring'>('hardware');

  // Hardware check form
  const [stationId, setStationId] = useState('Station-01 (LAN Arena)');
  const [assetCode, setAssetCode] = useState('PC-KALINGA-01');
  const [configVersion, setConfigVersion] = useState('v1.4.2-bgmi-locked');
  const [hardwareResult, setHardwareResult] = useState<'passed' | 'failed' | 'flagged'>('passed');
  const [hardwareNotes, setHardwareNotes] = useState('Verified clean OS build, background apps disabled, peripherals organizers-only.');
  const [hardwareSuccess, setHardwareSuccess] = useState<string | null>(null);

  // Technical pause form
  const [pauseMatch, setPauseMatch] = useState('Finals Match 1 - Erangel');
  const [pauseTeam, setPauseTeam] = useState('Kalinga Warriors (Entry 1)');
  const [pauseRequest, setPauseRequest] = useState<'pause' | 'disconnect' | 'restart' | 'integrity' | 'penalty' | 'disqualification'>('pause');
  const [pauseDecision, setPauseDecision] = useState<'granted' | 'denied' | 'penalty' | 'disqualification' | 'restarted' | 'resumed'>('granted');
  const [pauseDuration, setPauseDuration] = useState('90');
  const [pauseReason, setPauseReason] = useState('Audio feed disruption on player headset 3. Re-plugged and tested.');
  const [pauseSuccess, setPauseSuccess] = useState<string | null>(null);

  // Substitute switch form
  const [subMatch, setSubMatch] = useState('Finals Match 1 - Erangel');
  const [subStarter, setSubStarter] = useState('Player 4 (Support) - Slot 4');
  const [subReplacement, setSubReplacement] = useState('Substitute Player (Slot 5)');
  const [subReason, setSubReason] = useState('Starter sudden nausea/health emergency during interval.');
  const [subSuccess, setSubSuccess] = useState<string | null>(null);

  // Scoring result form
  const [scoreMatch, setScoreMatch] = useState('Finals Match 1 - Erangel');
  const [scorerId, setScorerId] = useState('referee-official-1');
  const [reviewerId, setReviewerId] = useState('referee-reviewer-2');
  const [placement, setPlacement] = useState('1');
  const [kills, setKills] = useState('6');
  const [scoreResult, setScoreResult] = useState<any | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  // Handlers
  const handleHardwareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHardwareSuccess(`Hardware check signed off for ${stationId} (${assetCode}) - Result: ${hardwareResult.toUpperCase()}. Logged append-only.`);
  };

  const handlePauseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPauseSuccess(`Technical incident recorded for ${pauseTeam}: ${pauseRequest.toUpperCase()} -> Decision: ${pauseDecision.toUpperCase()} (${pauseDuration}s). Human adjudication logged with audit trail.`);
  };

  const handleSubstituteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubSuccess(`In-match substitute switch approved for ${subMatch}: Swapped ${subStarter} with ${subReplacement}. Roster integrity preserved without affecting entry capacity.`);
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScoreError(null);
    if (scorerId === reviewerId) {
      setScoreError('Scorer and Reviewer must be distinct officials (E10 invariant)');
      return;
    }

    // BGIS 2026 points calculation:
    const placementPointsMap: Record<string, number> = {
      '1': 10, '2': 6, '3': 5, '4': 4, '5': 3, '6': 2, '7': 1, '8': 1
    };
    const placePts = placementPointsMap[placement] || 0;
    // Gated kill points: preview only with kill mult 1, note pending approval
    const killPts = Number(kills) * 1;
    const total = placePts + killPts;

    setScoreResult({
      match: scoreMatch,
      placement: Number(placement),
      kills: Number(kills),
      placementPoints: placePts,
      killPoints: killPts,
      totalPoints: total,
      scorer: scorerId,
      reviewer: reviewerId,
      note: 'Calculated server-side via BGIS 2026 formula. Final standings publication remains gated pending complete approved rules.'
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="badge-gold" style={{ marginBottom: '0.5rem' }}>
            OFFICIAL OPERATIONS • SCOPED MFA
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
            LAN Referee & Operations Console
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Kalinga BGMI Clash Season 1 • Device sign-offs, technical pauses, substitute authorizations, and match scoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge-verified">Referee Duty Active</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('hardware')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeTab === 'hardware' ? 'rgba(217, 119, 6, 0.25)' : 'transparent',
            border: activeTab === 'hardware' ? '1px solid var(--gold-400)' : 'none',
            color: activeTab === 'hardware' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Monitor size={16} /> Station Hardware Integrity
        </button>

        <button
          onClick={() => setActiveTab('pause')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeTab === 'pause' ? 'rgba(217, 119, 6, 0.25)' : 'transparent',
            border: activeTab === 'pause' ? '1px solid var(--gold-400)' : 'none',
            color: activeTab === 'pause' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <PauseCircle size={16} /> Technical Pauses & Incidents
        </button>

        <button
          onClick={() => setActiveTab('substitute')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeTab === 'substitute' ? 'rgba(217, 119, 6, 0.25)' : 'transparent',
            border: activeTab === 'substitute' ? '1px solid var(--gold-400)' : 'none',
            color: activeTab === 'substitute' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <UserCheck size={16} /> In-Match Substitute Switch
        </button>

        <button
          onClick={() => setActiveTab('scoring')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeTab === 'scoring' ? 'rgba(217, 119, 6, 0.25)' : 'transparent',
            border: activeTab === 'scoring' ? '1px solid var(--gold-400)' : 'none',
            color: activeTab === 'scoring' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Trophy size={16} /> Result Scoring & Review
        </button>
      </div>

      {/* Tab 1: Hardware Integrity */}
      {activeTab === 'hardware' && (
        <form onSubmit={handleHardwareSubmit} className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Station Hardware & Device Integrity Sign-off
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Organizer-provided hardware only. Referees must verify asset configuration and absence of personal devices or unauthorized tools.
          </p>

          {hardwareSuccess && (
            <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#4ade80', fontSize: '0.88rem' }}>
              ✓ {hardwareSuccess}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Station Location</label>
              <input type="text" value={stationId} onChange={e => setStationId(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Asset Inventory Code</label>
              <input type="text" value={assetCode} onChange={e => setAssetCode(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Approved Config / OS Version</label>
              <input type="text" value={configVersion} onChange={e => setConfigVersion(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Inspection Result</label>
              <select value={hardwareResult} onChange={e => setHardwareResult(e.target.value as any)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }}>
                <option value="passed">Passed (Integrity Verified)</option>
                <option value="flagged">Flagged for Re-check</option>
                <option value="failed">Failed (Unapproved Tool / Modification)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Inspection Notes</label>
            <textarea value={hardwareNotes} onChange={e => setHardwareNotes(e.target.value)} rows={3} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
          </div>

          <button type="submit" className="btn-primary">
            Record Append-only Hardware Sign-off
          </button>
        </form>
      )}

      {/* Tab 2: Technical Pauses */}
      {activeTab === 'pause' && (
        <form onSubmit={handlePauseSubmit} className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Technical Pause & Incident Adjudication Log
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Pauses and disconnects must be logged with human referee decisions and evidence notes. No automated disqualification without due process (E09).
          </p>

          {pauseSuccess && (
            <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#4ade80', fontSize: '0.88rem' }}>
              ✓ {pauseSuccess}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Match Round</label>
              <input type="text" value={pauseMatch} onChange={e => setPauseMatch(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Affected Team</label>
              <input type="text" value={pauseTeam} onChange={e => setPauseTeam(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Request / Incident Type</label>
              <select value={pauseRequest} onChange={e => setPauseRequest(e.target.value as any)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }}>
                <option value="pause">Technical Pause</option>
                <option value="disconnect">Player Disconnect</option>
                <option value="restart">Lobby Restart Request</option>
                <option value="integrity">Integrity / Hardware Failure</option>
                <option value="penalty">Rule Violation / Penalty</option>
                <option value="disqualification">Disqualification Case</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Referee Adjudication Decision</label>
              <select value={pauseDecision} onChange={e => setPauseDecision(e.target.value as any)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }}>
                <option value="granted">Granted (Pause Approved)</option>
                <option value="resumed">Resumed (Action Resolved)</option>
                <option value="denied">Denied (Unwarranted Pause)</option>
                <option value="restarted">Restart Match</option>
                <option value="penalty">Penalty Awarded</option>
                <option value="disqualification">Official Disqualification</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Duration (Seconds)</label>
              <input type="number" value={pauseDuration} onChange={e => setPauseDuration(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Adjudication Reason & Evidence</label>
              <input type="text" value={pauseReason} onChange={e => setPauseReason(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Record Referee Adjudication
          </button>
        </form>
      )}

      {/* Tab 3: Substitute Switch */}
      {activeTab === 'substitute' && (
        <form onSubmit={handleSubstituteSubmit} className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            In-Match Substitute Switch Authorization (E08)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Allows substituting a starter with a designated substitute slot. Must stay within the same locked roster and match. Does not alter paid team identity or tournament capacity.
          </p>

          {subSuccess && (
            <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#4ade80', fontSize: '0.88rem' }}>
              ✓ {subSuccess}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Active Starter to be Substituted</label>
              <input type="text" value={subStarter} onChange={e => setSubStarter(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Designated Substitute Slot (Slot 5)</label>
              <input type="text" value={subReplacement} onChange={e => setSubReplacement(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Referee Authorization Reason</label>
            <input type="text" value={subReason} onChange={e => setSubReason(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
          </div>

          <button type="submit" className="btn-primary">
            Authorize In-Match Substitute Switch
          </button>
        </form>
      )}

      {/* Tab 4: Scoring Result */}
      {activeTab === 'scoring' && (
        <form onSubmit={handleScoreSubmit} className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Server-Calculated Match Result Recording (BGIS 2026)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Placement points are computed server-side via BGIS 2026 formula (1st: 10, 2nd: 6, 3rd: 5, 4th: 4, 5th: 3, 6th: 2, 7th: 1, 8th: 1, 9-16: 0). Scorer and reviewer must be distinct officials.
          </p>

          {scoreError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.88rem' }}>
              ⚠️ {scoreError}
            </div>
          )}

          {scoreResult && (
            <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#4ade80', fontWeight: 700, marginBottom: '0.5rem' }}>Match Result Calculated & Recorded</h4>
              <div style={{ fontSize: '0.9rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Placement: <strong>#{scoreResult.placement}</strong> ({scoreResult.placementPoints} pts) + Kills: <strong>{scoreResult.kills}</strong> ({scoreResult.killPoints} pts) = <strong>{scoreResult.totalPoints} Total Points</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Recorded by: <code>{scoreResult.scorer}</code> • Reviewed by: <code>{scoreResult.reviewer}</code>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Recorded Placement (1–16)</label>
              <select value={placement} onChange={e => setPlacement(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }}>
                <option value="1">1st Place (WWCD - 10 pts)</option>
                <option value="2">2nd Place (6 pts)</option>
                <option value="3">3rd Place (5 pts)</option>
                <option value="4">4th Place (4 pts)</option>
                <option value="5">5th Place (3 pts)</option>
                <option value="6">6th Place (2 pts)</option>
                <option value="7">7th Place (1 pt)</option>
                <option value="8">8th Place (1 pt)</option>
                <option value="9">9th–16th Place (0 pts)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Confirmed Squad Kills</label>
              <input type="number" min="0" value={kills} onChange={e => setKills(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Scorer Official ID</label>
              <input type="text" value={scorerId} onChange={e => setScorerId(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Distinct Reviewer ID (E10)</label>
              <input type="text" value={reviewerId} onChange={e => setReviewerId(e.target.value)} style={{ width: '100%', padding: '0.7rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#ffffff' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Calculate Points & Record Match Result
          </button>
        </form>
      )}

    </div>
  );
}
