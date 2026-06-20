'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cases, rollSkin, RARITY_COLORS, Case, Skin } from '@/lib/data';
import { useStore } from '@/store/useStore';
import { FAKE_USERS } from '@/lib/data';

interface PlayerResult {
  name: string;
  isUser: boolean;
  skin: Skin;
  runningTotal: number;
}

interface BattleRound {
  roundNum: number;
  players: PlayerResult[];
}

const CASE_ICONS: Record<string, string> = {
  revolution: '⭐', kilowatt: '⚡', 'dreams-nightmares': '🌙',
  fracture: '💎', prisma2: '🔮', snakebite: '🐍',
  recoil: '🎯', clutch: '✊', horizon: '🌅',
};

export default function BattlePage() {
  const { balance, deductBalance, addBalance, addToInventory } = useStore();
  const [selectedCase, setSelectedCase] = useState<Case>(cases[0]);
  const [playerCount, setPlayerCount] = useState(2);
  const [rounds, setRounds] = useState(1);
  const [battleLog, setBattleLog] = useState<BattleRound[]>([]);
  const [battling, setBattling] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [userWon, setUserWon] = useState(false);
  const [prize, setPrize] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'battle' | 'result'>('setup');
  const botNames = useRef<string[]>([]);

  const entryFee = selectedCase.price * rounds;
  const totalPot = entryFee * playerCount;
  const canBattle = balance >= entryFee && !battling;

  const playerLabels = ['2v1', '3-Player', '4-Player'];

  const startBattle = async () => {
    if (!canBattle) return;
    if (!deductBalance(entryFee)) return;

    // Pick bots
    const shuffled = [...FAKE_USERS].sort(() => Math.random() - 0.5);
    botNames.current = shuffled.slice(0, playerCount - 1);
    const names = ['You', ...botNames.current];

    setPhase('battle');
    setBattleLog([]);
    setWinnerName(null);
    setBattling(true);

    const totals = new Array(playerCount).fill(0);
    const allUserSkins: Skin[] = [];

    for (let r = 0; r < rounds; r++) {
      await new Promise(res => setTimeout(res, 900));

      const players: PlayerResult[] = names.map((name, i) => {
        const skin = rollSkin(selectedCase.skins);
        totals[i] = Math.round((totals[i] + skin.price) * 100) / 100;
        if (i === 0) allUserSkins.push(skin);
        return { name, isUser: i === 0, skin, runningTotal: totals[i] };
      });

      setBattleLog(prev => [...prev, { roundNum: r + 1, players }]);
    }

    // Find winner
    const winnerIdx = totals.indexOf(Math.max(...totals));
    const won = winnerIdx === 0;
    setUserWon(won);
    setWinnerName(names[winnerIdx]);

    if (won) {
      addBalance(totalPot);
      allUserSkins.forEach(s => addToInventory(s));
      setPrize(totalPot);
    } else {
      setPrize(0);
    }

    setBattling(false);
    setPhase('result');
  };

  const reset = () => {
    setPhase('setup');
    setBattleLog([]);
    setWinnerName(null);
    setUserWon(false);
    setPrize(0);
  };

  return (
    <div className="max-w-[1136px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">⚔️ Case Battle</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Open cases simultaneously. Highest total value wins the entire pot!
        </p>
      </div>

      {/* Setup */}
      {phase === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-5">
            {/* Case selection */}
            <div className="card p-5">
              <h3 className="font-bold mb-3">Select Case</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {cases.map(c => {
                  const icon = CASE_ICONS[c.id] || '📦';
                  const active = selectedCase.id === c.id;
                  return (
                    <button key={c.id} onClick={() => setSelectedCase(c)}
                      className="p-3 rounded-xl text-left transition-all"
                      style={{
                        background: active ? 'rgba(249,115,22,0.15)' : 'var(--bg-secondary)',
                        border: `1px solid ${active ? '#f97316' : 'var(--border)'}`,
                      }}>
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-xs font-semibold truncate">{c.name}</div>
                      <div className="font-black text-yellow-400 text-sm">${c.price.toFixed(2)}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Players */}
            <div className="card p-5">
              <h3 className="font-bold mb-3">Number of Players</h3>
              <div className="flex gap-3">
                {[2, 3, 4].map(n => (
                  <button key={n} onClick={() => setPlayerCount(n)}
                    className="flex-1 py-3 rounded-xl font-black text-lg transition-all"
                    style={{
                      background: playerCount === n ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'var(--bg-secondary)',
                      color: playerCount === n ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${playerCount === n ? '#f97316' : 'var(--border)'}`,
                    }}>
                    {n}
                    <div className="text-xs font-normal mt-0.5">{n === 2 ? '1v1' : n === 3 ? '1v2' : '1v3'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rounds */}
            <div className="card p-5">
              <h3 className="font-bold mb-3">Rounds</h3>
              <div className="flex gap-3">
                {[1, 2, 3, 5].map(n => (
                  <button key={n} onClick={() => setRounds(n)}
                    className="flex-1 py-2.5 rounded-xl font-bold transition-all"
                    style={{
                      background: rounds === n ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'var(--bg-secondary)',
                      color: rounds === n ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${rounds === n ? '#f97316' : 'var(--border)'}`,
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card p-6 h-fit sticky top-20">
            <h3 className="font-bold mb-4">Battle Summary</h3>
            <div className="space-y-3 mb-5">
              {[
                { label: 'Case', value: selectedCase.name },
                { label: 'Players', value: `${playerCount} (${playerCount === 2 ? '1v1' : playerCount === 3 ? '1v2' : '1v3'})` },
                { label: 'Rounds', value: rounds },
                { label: 'Entry Fee', value: `$${entryFee.toFixed(2)}`, gold: true },
                { label: 'Total Pot', value: `$${totalPot.toFixed(2)}`, green: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span className={`font-bold ${row.gold ? 'text-yellow-400' : row.green ? 'text-green-400' : ''}`}>
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="h-px" style={{ background: 'var(--border)' }} />
            </div>

            {/* Players list */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>Y</div>
                <span className="font-semibold text-sm">You</span>
                <span className="ml-auto text-xs font-semibold" style={{ color: '#22c55e' }}>Ready ✓</span>
              </div>
              {Array.from({ length: playerCount - 1 }, (_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black text-white">
                    {FAKE_USERS[i][0]}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{FAKE_USERS[i]}</span>
                  <span className="ml-auto text-xs" style={{ color: '#22c55e' }}>Ready ✓</span>
                </div>
              ))}
            </div>

            <button onClick={startBattle} disabled={!canBattle}
              className="btn-primary w-full justify-center text-base py-3">
              ⚔️ Start Battle — ${entryFee.toFixed(2)}
            </button>
            {balance < entryFee && (
              <p className="text-xs text-red-400 text-center mt-2">Insufficient balance</p>
            )}
          </div>
        </div>
      )}

      {/* Battle / Result */}
      {(phase === 'battle' || phase === 'result') && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">
              {battling ? (
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                  Battle in Progress...
                </span>
              ) : '🏆 Battle Complete!'}
            </h2>
            {phase === 'result' && (
              <button onClick={reset} className="btn-secondary text-sm">New Battle</button>
            )}
          </div>

          {/* Winner banner */}
          {phase === 'result' && winnerName && (
            <div className="card p-6 mb-6 text-center animate-fade-up"
              style={{
                border: `2px solid ${userWon ? '#22c55e' : '#ef4444'}`,
                boxShadow: `0 0 40px ${userWon ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.15)'}`,
                background: `linear-gradient(135deg, ${userWon ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.06)'}, var(--bg-card))`,
              }}>
              <div className="text-5xl mb-3">{userWon ? '🏆' : '💀'}</div>
              <h2 className="text-2xl font-black mb-1">
                {userWon ? 'You Won!' : `${winnerName} Won`}
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                {userWon
                  ? `+$${prize.toFixed(2)} added to your balance! All skins saved to inventory.`
                  : `${winnerName} had the highest total value. Better luck next time!`}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={reset} className="btn-primary">Play Again</button>
                <Link href="/inventory" className="btn-secondary" style={{ textDecoration: 'none' }}>View Inventory</Link>
              </div>
            </div>
          )}

          {/* Round cards */}
          {battleLog.map(round => {
            const roundWinnerIdx = round.players.reduce((best, p, i) =>
              p.skin.price > round.players[best].skin.price ? i : best, 0);

            return (
              <div key={round.roundNum} className="card mb-4 animate-fade-up">
                <div className="px-4 py-2.5 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                    Round {round.roundNum}
                  </span>
                  {phase === 'result' && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
                      Winner: {round.players[roundWinnerIdx].name} (${round.players[roundWinnerIdx].skin.price.toFixed(2)})
                    </span>
                  )}
                </div>
                <div className="p-4 grid gap-3"
                  style={{ gridTemplateColumns: `repeat(${round.players.length}, 1fr)` }}>
                  {round.players.map((p, pi) => {
                    const clr = RARITY_COLORS[p.skin.rarity];
                    const isRoundWinner = pi === roundWinnerIdx;
                    return (
                      <div key={pi} className="text-center">
                        <div className="text-xs font-bold mb-2"
                          style={{ color: p.isUser ? '#f97316' : 'var(--text-muted)' }}>
                          {p.isUser ? '👤 You' : p.name}
                        </div>
                        <div className="h-24 rounded-xl flex items-center justify-center mb-2 transition-all overflow-hidden"
                          style={{
                            background: `${clr}15`,
                            border: `2px solid ${isRoundWinner ? clr : clr + '35'}`,
                            boxShadow: isRoundWinner ? `0 0 20px ${clr}40` : undefined,
                          }}>
                          <Image src={p.skin.image} alt={p.skin.name} width={90} height={65} className="object-contain" style={{ filter: `drop-shadow(0 2px 8px ${clr}60)` }} unoptimized />
                        </div>
                        <div className="text-xs font-bold truncate" style={{ color: clr, fontSize: 10 }}>
                          {p.skin.weapon} | {p.skin.name}
                        </div>
                        <div className="font-black text-yellow-400 text-sm">${p.skin.price.toFixed(2)}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          Total: ${p.runningTotal.toFixed(2)}
                        </div>
                        {isRoundWinner && (
                          <div className="text-xs text-green-400 font-semibold mt-1">🏅 Round Win</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {battling && battleLog.length === 0 && (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4" style={{ animation: 'pulse 1s infinite' }}>⚔️</div>
              <p style={{ color: 'var(--text-muted)' }}>Starting battle...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
