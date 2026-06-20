'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cases, rollSkin, RARITY_COLORS, RARITY_LABELS, Case, Skin } from '@/lib/data';
import { useStore } from '@/store/useStore';
import { FAKE_USERS } from '@/lib/data';

interface PlayerResult {
  name: string;
  isUser: boolean;
  skin: Skin;
  total: number;
}

interface Round {
  num: number;
  players: PlayerResult[];
}

const CASE_GRADS: Record<string, [string, string]> = {
  revolution: ['#1a0a2e', '#3d1b7a'], kilowatt: ['#0a1a2e', '#0d3b7a'],
  'dreams-nightmares': ['#1a0a2e', '#4b0d80'], fracture: ['#2e0a0a', '#7a1a1a'],
  prisma2: ['#0a2e18', '#1a7a3b'], snakebite: ['#0a2e1a', '#0d6e2d'],
  recoil: ['#1a1a2e', '#2d2d7a'], clutch: ['#2e1a0a', '#7a3b0d'],
  horizon: ['#0a1a2e', '#0d4a7a'],
};

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function KnifeIcon({ color }: { color: string }) {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none"
      style={{ filter: `drop-shadow(0 2px 8px ${color}80)` }}>
      <path d="M48 8 L16 40 L20 44 L24 48 L56 16 Z" fill={color} opacity="0.9" />
      <path d="M16 40 L12 52 L24 48 Z" fill={color} opacity="0.6" />
      <path d="M48 8 L56 16 L52 20 L44 12 Z" fill="white" opacity="0.3" />
    </svg>
  );
}

export default function BattlePage() {
  const { balance, deductBalance, addBalance, addToInventory } = useStore();
  const [selectedCase, setSelectedCase] = useState<Case>(cases[0]);
  const [playerCount, setPlayerCount] = useState(2);
  const [rounds, setRounds] = useState(1);
  const [log, setLog] = useState<Round[]>([]);
  const [totals, setTotals] = useState<number[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'battle' | 'result'>('setup');
  const [winnerIdx, setWinnerIdx] = useState(-1);
  const [prize, setPrize] = useState(0);

  const entryFee = selectedCase.price * rounds;
  const totalPot = entryFee * playerCount;
  const [from, to] = CASE_GRADS[selectedCase.id] || ['#1a1a2e', '#2d2d7a'];

  const startBattle = async () => {
    if (balance < entryFee) return;
    if (!deductBalance(entryFee)) return;

    const shuffled = [...FAKE_USERS].sort(() => Math.random() - 0.5);
    const botNames = shuffled.slice(0, playerCount - 1);
    const playerNames = ['You', ...botNames];

    setNames(playerNames);
    setLog([]);
    setTotals(new Array(playerCount).fill(0));
    setCurrentRound(0);
    setPhase('battle');

    const runningTotals = new Array(playerCount).fill(0);
    const allUserSkins: Skin[] = [];

    for (let r = 0; r < rounds; r++) {
      setIsSpinning(true);
      setCurrentRound(r + 1);
      await sleep(1400);

      const players: PlayerResult[] = playerNames.map((name, i) => {
        const skin = rollSkin(selectedCase.skins);
        runningTotals[i] = Math.round((runningTotals[i] + skin.price) * 100) / 100;
        if (i === 0) allUserSkins.push(skin);
        return { name, isUser: i === 0, skin, total: runningTotals[i] };
      });

      setIsSpinning(false);
      setLog(prev => [...prev, { num: r + 1, players }]);
      setTotals([...runningTotals]);
      await sleep(900);
    }

    const winIdx = runningTotals.indexOf(Math.max(...runningTotals));
    setWinnerIdx(winIdx);

    if (winIdx === 0) {
      addBalance(totalPot);
      allUserSkins.forEach(s => addToInventory(s));
      setPrize(totalPot);
    } else {
      setPrize(0);
    }

    setPhase('result');
  };

  const reset = () => {
    setPhase('setup');
    setLog([]);
    setTotals([]);
    setNames([]);
    setWinnerIdx(-1);
    setPrize(0);
    setCurrentRound(0);
    setIsSpinning(false);
  };

  return (
    <div className="max-w-[1136px] mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1">⚔️ Case Battle</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Open cases simultaneously — highest total value wins the pot!
        </p>
      </div>

      {/* ── SETUP ── */}
      {phase === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            {/* Case picker */}
            <div className="card p-5">
              <h3 className="font-bold mb-4">
                Select Case
                <span className="font-normal text-sm ml-2" style={{ color: 'var(--text-muted)' }}>
                  — {selectedCase.name}
                </span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {cases.map(c => {
                  const [cf, ct] = CASE_GRADS[c.id] || ['#1a1a2e', '#2d2d7a'];
                  const active = selectedCase.id === c.id;
                  return (
                    <button key={c.id} onClick={() => setSelectedCase(c)}
                      className="p-2 rounded-xl text-center transition-all flex flex-col items-center gap-1"
                      style={{
                        background: active ? `linear-gradient(135deg, ${cf}cc, ${ct}cc)` : 'var(--bg-secondary)',
                        border: `2px solid ${active ? 'rgba(249,115,22,0.7)' : 'var(--border)'}`,
                        boxShadow: active ? '0 0 18px rgba(249,115,22,0.2)' : undefined,
                      }}>
                      <Image src={c.image} alt={c.name} width={44} height={44} className="object-contain" unoptimized />
                      <div className="font-semibold leading-tight" style={{ color: active ? 'white' : 'var(--text-muted)', fontSize: 9 }}>
                        {c.name.replace(' Case', '').replace(' & ', ' &\n')}
                      </div>
                      <div className="font-black text-yellow-400" style={{ fontSize: 10 }}>${c.price.toFixed(2)}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Players & Rounds */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <h3 className="font-bold text-sm mb-3">Players</h3>
                <div className="flex gap-2">
                  {[2, 3, 4].map(n => (
                    <button key={n} onClick={() => setPlayerCount(n)}
                      className="flex-1 py-3 rounded-xl font-black text-xl transition-all"
                      style={{
                        background: playerCount === n ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'var(--bg-secondary)',
                        color: playerCount === n ? 'white' : 'var(--text-secondary)',
                        border: `1px solid ${playerCount === n ? '#f97316' : 'var(--border)'}`,
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-1">
                  {[2, 3, 4].map(n => (
                    <div key={n} className="flex-1 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                      {n === 2 ? '1v1' : n === 3 ? '1v2' : '1v3'}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4">
                <h3 className="font-bold text-sm mb-3">Rounds</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 5].map(n => (
                    <button key={n} onClick={() => setRounds(n)}
                      className="flex-1 py-3 rounded-xl font-bold transition-all"
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
          </div>

          {/* Summary */}
          <div className="card p-5 h-fit sticky" style={{ top: 'calc(var(--topbar-h) + 16px)' }}>
            {/* Case preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl mb-5"
              style={{ background: `linear-gradient(135deg, ${from}cc, ${to}cc)`, border: '1px solid rgba(255,255,255,0.08)' }}>
              <Image src={selectedCase.image} alt={selectedCase.name} width={52} height={52} className="object-contain flex-shrink-0" unoptimized />
              <div>
                <div className="font-bold leading-tight">{selectedCase.name}</div>
                <div className="text-yellow-400 font-black text-lg">${selectedCase.price.toFixed(2)}</div>
              </div>
            </div>

            <div className="space-y-2.5 mb-5 text-sm">
              {[
                { label: 'Players', value: `${playerCount} (${playerCount === 2 ? '1v1' : playerCount === 3 ? '1v2' : '1v3'})` },
                { label: 'Rounds', value: rounds },
                { label: 'Your entry', value: `$${entryFee.toFixed(2)}`, gold: true },
                { label: 'Total pot', value: `$${totalPot.toFixed(2)}`, green: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span className={`font-bold ${row.gold ? 'text-yellow-400' : row.green ? 'text-green-400' : ''}`}>
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="h-px mt-1" style={{ background: 'var(--border)' }} />
            </div>

            {/* Player list */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>Y</div>
                <span className="font-semibold">You</span>
                <span className="ml-auto text-xs text-green-400">✓ Ready</span>
              </div>
              {Array.from({ length: playerCount - 1 }, (_, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                    {FAKE_USERS[i][0]}
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }} className="truncate">{FAKE_USERS[i]}</span>
                  <span className="ml-auto text-xs text-green-400 flex-shrink-0">✓ Ready</span>
                </div>
              ))}
            </div>

            <button onClick={startBattle} disabled={balance < entryFee}
              className="btn-primary w-full justify-center text-base py-3">
              ⚔️ Start Battle — ${entryFee.toFixed(2)}
            </button>
            {balance < entryFee && (
              <p className="text-xs text-red-400 text-center mt-2">Insufficient balance</p>
            )}
          </div>
        </div>
      )}

      {/* ── BATTLE / RESULT ── */}
      {(phase === 'battle' || phase === 'result') && (
        <div>
          {/* Winner banner */}
          {phase === 'result' && winnerIdx >= 0 && (
            <div className="card p-6 mb-6 text-center animate-fade-up"
              style={{
                border: `2px solid ${winnerIdx === 0 ? '#22c55e' : '#ef4444'}`,
                boxShadow: `0 0 50px ${winnerIdx === 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
                background: `linear-gradient(135deg, ${winnerIdx === 0 ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.05)'}, var(--bg-card))`,
              }}>
              <div className="text-6xl mb-3">{winnerIdx === 0 ? '🏆' : '💀'}</div>
              <h2 className="text-3xl font-black mb-2">
                {winnerIdx === 0 ? 'You Won!' : `${names[winnerIdx]} Won`}
              </h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                {winnerIdx === 0
                  ? `+$${prize.toFixed(2)} added to balance · All skins saved to inventory`
                  : `${names[winnerIdx]} had the highest total value. Better luck next time!`}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={reset} className="btn-primary">Play Again</button>
                <Link href="/inventory" className="btn-secondary" style={{ textDecoration: 'none' }}>View Inventory</Link>
              </div>
            </div>
          )}

          {/* Arena header */}
          <div className="card p-4 mb-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                <Image src={selectedCase.image} alt={selectedCase.name} width={36} height={36} className="object-contain" unoptimized />
              </div>
              <div>
                <div className="font-bold text-sm">{selectedCase.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {playerCount} players · {rounds} round{rounds > 1 ? 's' : ''} · Pot: ${totalPot.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {isSpinning && (
                <span className="flex items-center gap-2 text-sm font-semibold text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  Round {currentRound} of {rounds}
                </span>
              )}
              {phase === 'result' && (
                <button onClick={reset} className="btn-secondary text-sm">New Battle</button>
              )}
            </div>
          </div>

          {/* Score board */}
          <div className="card p-4 mb-4">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
              Scoreboard
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${playerCount}, 1fr)` }}>
              {(names.length > 0 ? names : Array.from({ length: playerCount }, (_, i) => i === 0 ? 'You' : `Bot ${i}`)).map((name, i) => {
                const total = totals[i] ?? 0;
                const isWinner = phase === 'result' && i === winnerIdx;
                const isUser = i === 0;
                return (
                  <div key={i} className="text-center py-3 px-2 rounded-xl transition-all"
                    style={{
                      background: isWinner ? 'rgba(34,197,94,0.1)' : isUser ? 'rgba(249,115,22,0.07)' : 'var(--bg-secondary)',
                      border: `2px solid ${isWinner ? '#22c55e' : isUser ? 'rgba(249,115,22,0.5)' : 'var(--border)'}`,
                      boxShadow: isWinner ? '0 0 20px rgba(34,197,94,0.2)' : undefined,
                    }}>
                    <div className="w-9 h-9 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-black text-white"
                      style={{ background: isUser ? 'linear-gradient(135deg,#f97316,#ea580c)' : '#1e3a5f' }}>
                      {name[0]}
                    </div>
                    <div className="font-semibold text-xs truncate mb-1.5" style={{ color: isUser ? '#f97316' : 'var(--text-primary)' }}>
                      {name}
                    </div>
                    <div className="font-black text-yellow-400 text-lg leading-none">${total.toFixed(2)}</div>
                    {isWinner && <div className="text-xs text-green-400 font-bold mt-1">🏆 Winner</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spinning indicator */}
          {isSpinning && (
            <div className="card p-10 mb-4 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-5 mx-auto animate-spin"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                <Image src={selectedCase.image} alt="" width={64} height={64} className="object-contain" unoptimized />
              </div>
              <div className="font-black text-2xl mb-1">Opening Round {currentRound}...</div>
              <div style={{ color: 'var(--text-muted)' }}>All players are rolling simultaneously</div>
            </div>
          )}

          {/* Round log */}
          {log.map((round) => {
            const roundWinIdx = round.players.reduce(
              (best, p, i) => p.skin.price > round.players[best].skin.price ? i : best, 0
            );
            return (
              <div key={round.num} className="card mb-4 battle-reveal">
                <div className="px-5 py-3 border-b flex items-center gap-3 flex-wrap" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-sm font-black px-3 py-1 rounded-lg"
                    style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
                    Round {round.num}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    🏅 <strong style={{ color: 'var(--text-primary)' }}>{round.players[roundWinIdx].name}</strong> wins this round
                    &nbsp;·&nbsp; ${round.players[roundWinIdx].skin.price.toFixed(2)}
                  </span>
                </div>

                <div className="p-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${round.players.length}, 1fr)` }}>
                  {round.players.map((p, pi) => {
                    const clr = RARITY_COLORS[p.skin.rarity];
                    const isRoundWin = pi === roundWinIdx;
                    const isKnife = p.skin.weapon.startsWith('★');
                    return (
                      <div key={pi} className="rounded-xl overflow-hidden skin-reveal"
                        style={{
                          background: `${clr}0c`,
                          border: `2px solid ${isRoundWin ? clr : clr + '28'}`,
                          boxShadow: isRoundWin ? `0 0 20px ${clr}35` : undefined,
                        }}>
                        {/* Player header */}
                        <div className="px-3 py-2 flex items-center gap-2"
                          style={{ background: isRoundWin ? `${clr}15` : 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${clr}20` }}>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                            style={{ background: p.isUser ? 'linear-gradient(135deg,#f97316,#ea580c)' : '#1e3a5f' }}>
                            {p.name[0]}
                          </div>
                          <span className="text-xs font-bold truncate" style={{ color: p.isUser ? '#f97316' : 'var(--text-muted)' }}>
                            {p.isUser ? '👤 You' : p.name}
                          </span>
                          {isRoundWin && <span className="ml-auto text-xs font-bold text-green-400 flex-shrink-0">🏅 Win</span>}
                        </div>

                        {/* Skin display */}
                        <div className="p-3 text-center">
                          <div className="h-24 flex items-center justify-center mb-2 rounded-lg"
                            style={{ background: `linear-gradient(180deg, ${clr}18, transparent)` }}>
                            {isKnife ? (
                              <KnifeIcon color={clr} />
                            ) : (
                              <Image src={p.skin.image} alt={p.skin.name} width={90} height={66}
                                className="object-contain"
                                style={{ filter: `drop-shadow(0 2px 10px ${clr}70)` }}
                                unoptimized />
                            )}
                          </div>

                          <div className="text-xs font-bold mb-0.5 truncate" style={{ color: clr, fontSize: 9 }}>
                            {RARITY_LABELS[p.skin.rarity].toUpperCase()}
                          </div>
                          <div className="font-semibold truncate text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                            {p.skin.weapon} | {p.skin.name}
                          </div>
                          <div className="font-black text-yellow-400 text-base">${p.skin.price.toFixed(2)}</div>
                          <div className="text-xs mt-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
                            Total: <span style={{ color: 'var(--text-primary)' }}>${p.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
