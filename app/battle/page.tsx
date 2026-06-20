'use client';
import { useState } from 'react';
import Link from 'next/link';
import { cases, rollSkin, RARITY_COLORS, Case, Skin } from '@/lib/data';
import { useStore } from '@/store/useStore';
import { FAKE_USERS } from '@/lib/data';

interface Player {
  name: string;
  isUser: boolean;
  skin: Skin | null;
  total: number;
}

interface Round {
  players: Player[];
}

export default function BattlePage() {
  const { balance, deductBalance, addBalance, addToInventory } = useStore();
  const [selectedCase, setSelectedCase] = useState<Case>(cases[0]);
  const [playerCount, setPlayerCount] = useState(2);
  const [rounds, setRounds] = useState(1);
  const [battleRounds, setBattleRounds] = useState<Round[]>([]);
  const [battling, setBattling] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [phase, setPhase] = useState<'setup' | 'battle' | 'result'>('setup');

  const totalCost = selectedCase.price * rounds;
  const canBattle = balance >= totalCost && !battling;

  const startBattle = async () => {
    if (!canBattle) return;
    if (!deductBalance(totalCost)) return;

    setPhase('battle');
    setBattleRounds([]);
    setWinner(null);
    setBattling(true);

    const botNames = FAKE_USERS.filter(n => n !== 'You').slice(0, playerCount - 1);
    const players: Player[] = [
      { name: 'You', isUser: true, skin: null, total: 0 },
      ...botNames.map(name => ({ name, isUser: false, skin: null, total: 0 })),
    ];

    const totals = new Array(playerCount).fill(0);

    for (let r = 0; r < rounds; r++) {
      await new Promise(res => setTimeout(res, 800));
      const roundResult: Player[] = players.map((p, i) => {
        const skin = rollSkin(selectedCase.skins);
        totals[i] += skin.price;
        return { ...p, skin, total: totals[i] };
      });
      setBattleRounds(prev => [...prev, { players: roundResult }]);
    }

    // Determine winner
    const finalTotals = totals.map((t, i) => ({ player: players[i], total: t }));
    const winnerIdx = finalTotals.reduce((best, cur, i) => cur.total > finalTotals[best].total ? i : best, 0);
    const winnerPlayer = { ...players[winnerIdx], total: totals[winnerIdx] };
    setWinner(winnerPlayer);

    if (winnerPlayer.isUser) {
      const prize = totals.reduce((s, t) => s + t, 0);
      addBalance(prize);
      // Add won skins to inventory
      battleRounds.flat();
    }

    setBattling(false);
    setPhase('result');
  };

  return (
    <div className="max-w-[1136px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">⚔️ Case Battle</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Compete against other players. Open cases simultaneously — highest total value wins!
        </p>
      </div>

      {phase === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Config */}
          <div className="space-y-5">
            {/* Case selection */}
            <div className="card p-5">
              <h3 className="font-semibold mb-3">Select Case</h3>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {cases.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      background: selectedCase.id === c.id ? 'rgba(249,115,22,0.15)' : 'var(--bg-secondary)',
                      border: `1px solid ${selectedCase.id === c.id ? '#f97316' : 'var(--border)'}`,
                    }}
                  >
                    <div className="text-2xl mb-1">📦</div>
                    <div className="text-xs font-semibold truncate">{c.name}</div>
                    <div className="text-sm font-black text-yellow-400">${c.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Players */}
            <div className="card p-5">
              <h3 className="font-semibold mb-3">Players</h3>
              <div className="flex gap-2">
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setPlayerCount(n)}
                    className="flex-1 py-2 rounded-lg font-bold transition-all"
                    style={{
                      background: playerCount === n ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'var(--bg-secondary)',
                      color: playerCount === n ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${playerCount === n ? '#f97316' : 'var(--border)'}`,
                    }}
                  >
                    {n}v{n - 1 === 0 ? 1 : n - 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Rounds */}
            <div className="card p-5">
              <h3 className="font-semibold mb-3">Rounds</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRounds(n)}
                    className="flex-1 py-2 rounded-lg font-bold transition-all"
                    style={{
                      background: rounds === n ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'var(--bg-secondary)',
                      color: rounds === n ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${rounds === n ? '#f97316' : 'var(--border)'}`,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card p-6 h-fit">
            <h3 className="font-semibold mb-4">Battle Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Case</span>
                <span className="font-semibold">{selectedCase.name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Players</span>
                <span className="font-semibold">{playerCount}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Rounds</span>
                <span className="font-semibold">{rounds}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Entry Cost</span>
                <span className="font-bold text-yellow-400">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Max Prize</span>
                <span className="font-black text-green-400">${(totalCost * playerCount).toFixed(2)}</span>
              </div>
            </div>

            {/* Players preview */}
            <div className="mb-6">
              <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Players:</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">Y</div>
                  <span className="font-semibold text-sm">You</span>
                  <span className="ml-auto text-xs text-orange-400">Ready</span>
                </div>
                {Array.from({ length: playerCount - 1 }, (_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {FAKE_USERS[i][0]}
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{FAKE_USERS[i]}</span>
                    <span className="ml-auto text-xs text-green-400">Ready</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startBattle}
              disabled={!canBattle}
              className="btn-primary w-full text-lg py-3 justify-center"
            >
              ⚔️ Start Battle — ${totalCost.toFixed(2)}
            </button>
            {balance < totalCost && (
              <p className="text-xs text-red-400 text-center mt-2">Insufficient balance</p>
            )}
          </div>
        </div>
      )}

      {/* Battle in progress / result */}
      {(phase === 'battle' || phase === 'result') && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {battling ? '⚔️ Battle in Progress...' : '🏆 Battle Complete!'}
            </h2>
            {phase === 'result' && (
              <button onClick={() => setPhase('setup')} className="btn-secondary text-sm">
                New Battle
              </button>
            )}
          </div>

          {/* Winner banner */}
          {phase === 'result' && winner && (
            <div
              className={`card p-6 mb-6 text-center animate-fade-up ${winner.isUser ? 'border-green-500' : 'border-red-500'}`}
              style={{
                border: `2px solid ${winner.isUser ? '#22c55e' : '#ef4444'}`,
                boxShadow: `0 0 40px ${winner.isUser ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)'}`,
              }}
            >
              <div className="text-5xl mb-2">{winner.isUser ? '🏆' : '💀'}</div>
              <h2 className="text-2xl font-black mb-1">
                {winner.isUser ? 'You Won!' : `${winner.name} Won`}
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                {winner.isUser
                  ? `You won $${(totalCost * playerCount).toFixed(2)} in prizes!`
                  : 'Better luck next time!'}
              </p>
            </div>
          )}

          {/* Rounds display */}
          {battleRounds.map((round, rIdx) => (
            <div key={rIdx} className="card mb-4">
              <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Round {rIdx + 1}
                </span>
              </div>
              <div className="p-4">
                <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${playerCount}, 1fr)` }}>
                  {round.players.map((p, pIdx) => {
                    const clr = p.skin ? RARITY_COLORS[p.skin.rarity] : '#64748b';
                    const isRoundWinner = round.players.every((x, i) => i === pIdx || (p.skin?.price || 0) >= (x.skin?.price || 0));
                    return (
                      <div key={pIdx} className="text-center">
                        <div className="text-xs mb-2 font-semibold" style={{ color: p.isUser ? '#f97316' : 'var(--text-muted)' }}>
                          {p.isUser ? '👤 You' : p.name}
                        </div>
                        <div
                          className="h-24 rounded-xl flex items-center justify-center text-4xl mb-2"
                          style={{
                            background: `${clr}15`,
                            border: `2px solid ${isRoundWinner ? clr : clr + '30'}`,
                            boxShadow: isRoundWinner ? `0 0 15px ${clr}40` : undefined,
                          }}
                        >
                          🔫
                        </div>
                        {p.skin && (
                          <>
                            <div className="text-xs font-semibold" style={{ color: clr }}>
                              {p.skin.weapon} | {p.skin.name}
                            </div>
                            <div className="font-bold text-yellow-400">${p.skin.price.toFixed(2)}</div>
                          </>
                        )}
                        {isRoundWinner && (
                          <div className="text-xs text-green-400 mt-1">🏅 Round Win</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {battling && (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-3 animate-pulse">⚔️</div>
              <div style={{ color: 'var(--text-muted)' }}>Opening cases...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
