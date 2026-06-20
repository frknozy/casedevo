'use client';
import { useState } from 'react';

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export default function ProvablyFairPage() {
  const [serverSeed, setServerSeed] = useState('a1b2c3d4e5f6g7h8i9j0');
  const [clientSeed, setClientSeed] = useState('my-lucky-seed-2024');
  const [nonce, setNonce] = useState('1');
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const serverSeedHash = hashString(serverSeed);

  const verify = () => {
    const combined = `${serverSeed}:${clientSeed}:${nonce}`;
    const result = hashString(combined);
    const float = parseInt(result.slice(0, 8), 16) / 0xffffffff;
    setVerifyResult(`Hash: ${result} → Float: ${float.toFixed(8)}`);
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">🔐 Provably Fair</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Every outcome on CaseHug is provably fair. You can verify any result independently.
        </p>
      </div>

      {/* How it works */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">How It Works</h2>
        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Server Seed',
              desc: 'Before each game, we generate a random server seed and provide you with its hash. This commits us to the outcome before you act.',
              icon: '🖥️',
              color: '#4b69ff',
            },
            {
              step: '2',
              title: 'Client Seed',
              desc: 'You provide a client seed (or we generate one). This ensures you have influence over the outcome, preventing manipulation.',
              icon: '👤',
              color: '#8847ff',
            },
            {
              step: '3',
              title: 'Nonce',
              desc: 'Each bet increments a nonce counter, ensuring every roll produces a unique result even with the same seeds.',
              icon: '🔢',
              color: '#d32ce6',
            },
            {
              step: '4',
              title: 'Result Generation',
              desc: 'The outcome is computed as HMAC-SHA256(serverSeed, clientSeed + nonce), then converted to a float between 0 and 1.',
              icon: '🎲',
              color: '#f97316',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 p-4 rounded-xl" style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
              <div className="text-2xl flex-shrink-0">{item.icon}</div>
              <div>
                <h3 className="font-bold mb-1" style={{ color: item.color }}>
                  Step {item.step}: {item.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification tool */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Verify a Result</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Server Seed
            </label>
            <input
              value={serverSeed}
              onChange={e => setServerSeed(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Hash: <span className="font-mono text-orange-400">{serverSeedHash}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Client Seed
            </label>
            <input
              value={clientSeed}
              onChange={e => setClientSeed(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Nonce
            </label>
            <input
              value={nonce}
              onChange={e => setNonce(e.target.value)}
              type="number"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          <button onClick={verify} className="btn-primary">
            🔍 Verify Result
          </button>
          {verifyResult && (
            <div className="p-3 rounded-lg font-mono text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: '#22c55e' }}>
              {verifyResult}
            </div>
          )}
        </div>
      </div>

      {/* Odds table */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Drop Rates</h2>
        <div className="space-y-2">
          {[
            { rarity: 'Consumer Grade', color: '#b0c3d9', chance: '79.92%' },
            { rarity: 'Industrial Grade', color: '#5e98d9', chance: '15.98%' },
            { rarity: 'Mil-Spec', color: '#4b69ff', chance: '3.20%' },
            { rarity: 'Restricted', color: '#8847ff', chance: '0.64%' },
            { rarity: 'Classified', color: '#d32ce6', chance: '0.128%' },
            { rarity: 'Covert', color: '#eb4b4b', chance: '0.0256%' },
            { rarity: 'Extraordinary (Knife/Glove)', color: '#e4ae39', chance: '0.0064%' },
          ].map((row) => (
            <div key={row.rarity} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: row.color }} />
              <div className="flex-1 text-sm" style={{ color: row.color }}>{row.rarity}</div>
              <div className="font-mono text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{row.chance}</div>
              <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, parseFloat(row.chance) / 80 * 100)}%`,
                    background: row.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          * StatTrak™ items have an additional ~10% chance modifier applied to any eligible drop.
        </p>
      </div>
    </div>
  );
}
