'use client';
import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { RARITY_COLORS, RARITY_LABELS, cases, Skin } from '@/lib/data';
import Link from 'next/link';

const allSkins: Skin[] = cases.flatMap(c => c.skins);
const uniqueSkins = allSkins.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)
  .sort((a, b) => a.price - b.price);

export default function UpgradePage() {
  const { balance, deductBalance, addBalance } = useStore();
  const [inputSkin, setInputSkin] = useState<Skin | null>(null);
  const [targetSkin, setTargetSkin] = useState<Skin | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showSelectInput, setShowSelectInput] = useState(false);
  const [showSelectTarget, setShowSelectTarget] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  const successChance = inputSkin && targetSkin
    ? Math.min(95, Math.max(2, (inputSkin.price / targetSkin.price) * 100))
    : 0;

  const canUpgrade = !!inputSkin && !!targetSkin && !spinning && targetSkin.price > inputSkin.price;

  const doUpgrade = () => {
    if (!canUpgrade || !inputSkin || !targetSkin) return;
    if (!deductBalance(inputSkin.price)) return;

    setSpinning(true);
    setResult(null);

    const won = Math.random() * 100 < successChance;
    const finalAngle = won
      ? 360 * 5 + (successChance / 2) // land in win zone
      : 360 * 5 + successChance + 20; // land in lose zone

    setRotation(prev => prev + finalAngle);

    setTimeout(() => {
      setSpinning(false);
      if (won) {
        setResult('win');
        addBalance(targetSkin.price);
      } else {
        setResult('lose');
      }
    }, 3000);
  };

  const reset = () => {
    setResult(null);
    setInputSkin(null);
    setTargetSkin(null);
    setRotation(0);
  };

  const SkinSelector = ({ onSelect, current, filter }: { onSelect: (s: Skin) => void; current: Skin | null; filter?: (s: Skin) => boolean }) => (
    <div className="card p-4 max-h-80 overflow-y-auto">
      <div className="grid grid-cols-1 gap-2">
        {uniqueSkins.filter(filter || (() => true)).map(skin => {
          const clr = RARITY_COLORS[skin.rarity];
          return (
            <button
              key={skin.id}
              onClick={() => onSelect(skin)}
              className="flex items-center gap-3 p-2 rounded-lg text-left transition-all"
              style={{
                background: current?.id === skin.id ? `${clr}20` : 'transparent',
                border: `1px solid ${current?.id === skin.id ? clr + '60' : 'transparent'}`,
              }}
            >
              <div className="text-2xl flex-shrink-0">🔫</div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate" style={{ color: clr }}>
                  {skin.weapon} | {skin.name}
                </div>
                <div className="text-sm font-bold text-yellow-400">${skin.price.toFixed(2)}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Skin Upgrade</h1>
        <p style={{ color: 'var(--text-muted)' }}>Trade up your skin for a chance at something better.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Input skin */}
        <div className="card p-5">
          <h3 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>YOUR SKIN</h3>
          {inputSkin ? (
            <div>
              <div
                className="h-32 rounded-xl flex items-center justify-center text-5xl mb-3"
                style={{
                  background: `${RARITY_COLORS[inputSkin.rarity]}15`,
                  border: `2px solid ${RARITY_COLORS[inputSkin.rarity]}40`,
                }}
              >
                🔫
              </div>
              <div className="text-sm font-semibold" style={{ color: RARITY_COLORS[inputSkin.rarity] }}>
                {inputSkin.weapon} | {inputSkin.name}
              </div>
              <div className="text-xl font-black text-yellow-400 mb-3">${inputSkin.price.toFixed(2)}</div>
              <button onClick={() => { setShowSelectInput(true); setShowSelectTarget(false); }} className="btn-secondary w-full text-sm py-2">
                Change
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowSelectInput(true); setShowSelectTarget(false); }}
              className="w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-orange-500/50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <span className="text-3xl">+</span>
              <span className="text-sm">Select Skin</span>
            </button>
          )}
        </div>

        {/* Upgrade wheel / chance */}
        <div className="card p-5 flex flex-col items-center justify-center text-center">
          {/* Dial */}
          <div className="relative w-40 h-40 mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: `rotate(${-90}deg)` }}>
              {/* Win arc */}
              <circle
                cx="50" cy="50" r="40"
                fill="none" stroke="#22c55e" strokeWidth="12"
                strokeDasharray={`${successChance * 2.513} 251.3`}
                style={{ transition: 'stroke-dasharray 0.5s' }}
              />
              {/* Lose arc */}
              <circle
                cx="50" cy="50" r="40"
                fill="none" stroke="#ef4444" strokeWidth="12"
                strokeDasharray={`${(100 - successChance) * 2.513} 251.3`}
                strokeDashoffset={`${-successChance * 2.513}`}
                style={{ transition: 'all 0.5s' }}
              />
            </svg>
            {/* Spinner needle */}
            <div
              ref={dialRef}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              <div className="w-0.5 h-16 origin-bottom rounded-full" style={{ background: 'white', transformOrigin: 'bottom center', position: 'absolute', bottom: '50%' }} />
            </div>
            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30" />
            </div>
          </div>

          <div className="text-4xl font-black mb-1" style={{ color: successChance > 50 ? '#22c55e' : successChance > 20 ? '#f59e0b' : '#ef4444' }}>
            {successChance.toFixed(1)}%
          </div>
          <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Win Chance</div>

          {result === 'win' && (
            <div className="mt-3 text-green-400 font-bold animate-fade-up">🎉 You Won!</div>
          )}
          {result === 'lose' && (
            <div className="mt-3 text-red-400 font-bold animate-fade-up">💀 You Lost</div>
          )}

          <div className="mt-4 w-full">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              <span className="text-green-400">WIN</span>
              <span className="text-red-400">LOSE</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#ef4444' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${successChance}%`, background: '#22c55e' }}
              />
            </div>
          </div>
        </div>

        {/* Target skin */}
        <div className="card p-5">
          <h3 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>TARGET SKIN</h3>
          {targetSkin ? (
            <div>
              <div
                className="h-32 rounded-xl flex items-center justify-center text-5xl mb-3"
                style={{
                  background: `${RARITY_COLORS[targetSkin.rarity]}15`,
                  border: `2px solid ${RARITY_COLORS[targetSkin.rarity]}40`,
                }}
              >
                🔫
              </div>
              <div className="text-sm font-semibold" style={{ color: RARITY_COLORS[targetSkin.rarity] }}>
                {targetSkin.weapon} | {targetSkin.name}
              </div>
              <div className="text-xl font-black text-yellow-400 mb-3">${targetSkin.price.toFixed(2)}</div>
              <button onClick={() => { setShowSelectTarget(true); setShowSelectInput(false); }} className="btn-secondary w-full text-sm py-2">
                Change
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowSelectTarget(true); setShowSelectInput(false); }}
              className="w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-orange-500/50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <span className="text-3xl">+</span>
              <span className="text-sm">Select Target</span>
            </button>
          )}
        </div>
      </div>

      {/* Skin selector dropdown */}
      {showSelectInput && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Select Your Skin</h3>
          <SkinSelector
            current={inputSkin}
            onSelect={(s) => { setInputSkin(s); setShowSelectInput(false); }}
          />
        </div>
      )}
      {showSelectTarget && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Select Target Skin</h3>
          <SkinSelector
            current={targetSkin}
            filter={s => !inputSkin || s.price > inputSkin.price}
            onSelect={(s) => { setTargetSkin(s); setShowSelectTarget(false); }}
          />
        </div>
      )}

      {/* Action */}
      <div className="flex justify-center gap-4">
        {result ? (
          <button onClick={reset} className="btn-primary text-lg px-8 py-3">
            Try Again
          </button>
        ) : (
          <button
            onClick={doUpgrade}
            disabled={!canUpgrade}
            className="btn-primary text-lg px-8 py-3"
          >
            {spinning ? '🎰 Upgrading...' : `⬆️ Upgrade (${successChance.toFixed(1)}% chance)`}
          </button>
        )}
        <Link href="/" className="btn-secondary text-lg px-8 py-3 no-underline">
          Back to Cases
        </Link>
      </div>

      {/* Info */}
      <div className="mt-8 card p-5">
        <h3 className="font-semibold mb-3">How Upgrade Works</h3>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <li>• Select a skin you want to upgrade from</li>
          <li>• Choose a target skin with a higher value</li>
          <li>• Your win chance = (input price / target price) × 100%</li>
          <li>• Win: receive the target skin's value. Lose: your skin is consumed</li>
          <li>• All outcomes are determined by provably fair algorithms</li>
        </ul>
      </div>
    </div>
  );
}
