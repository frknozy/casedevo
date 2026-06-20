'use client';

const CASE_GRADIENTS: Record<string, [string, string]> = {
  revolution: ['#1a0a2e', '#2d1b6e'],
  kilowatt: ['#0a1a2e', '#0d3b6e'],
  'dreams-nightmares': ['#1a0a2e', '#3b0d6e'],
  fracture: ['#2e0a0a', '#6e1a1a'],
  prisma2: ['#0a2e0a', '#1a6e3b'],
  snakebite: ['#0a2e1a', '#0d6e2d'],
  recoil: ['#1a1a2e', '#2d2d6e'],
  clutch: ['#2e1a0a', '#6e3b0d'],
  horizon: ['#0a1a2e', '#0d4a6e'],
};

const CASE_ICONS: Record<string, string> = {
  revolution: '⭐',
  kilowatt: '⚡',
  'dreams-nightmares': '🌙',
  fracture: '💎',
  prisma2: '🔮',
  snakebite: '🐍',
  recoil: '🎯',
  clutch: '✊',
  horizon: '🌅',
};

export default function CaseImage({ caseId, size = 'md' }: { caseId: string; size?: 'sm' | 'md' | 'lg' }) {
  const [from, to] = CASE_GRADIENTS[caseId] || ['#1a1a2e', '#2d2d6e'];
  const icon = CASE_ICONS[caseId] || '📦';
  const s = size === 'sm' ? 48 : size === 'lg' ? 128 : 80;

  return (
    <div
      style={{
        width: s,
        height: s,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: s * 0.45,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  );
}
