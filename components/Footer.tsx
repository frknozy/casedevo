import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t mt-16" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-[1136px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                <span className="text-white font-black text-xs">CH</span>
              </div>
              <span className="font-black text-lg">case<span className="gradient-text">hug</span></span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              The best CS2 case opening experience. Open cases, win skins, trade with friends.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Games</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><Link href="/" className="hover:text-white transition-colors">Cases</Link></li>
              <li><Link href="/upgrade" className="hover:text-white transition-colors">Upgrade</Link></li>
              <li><Link href="/battle" className="hover:text-white transition-colors">Case Battle</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Info</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><Link href="/provably-fair" className="hover:text-white transition-colors">Provably Fair</Link></li>
              <li><Link href="/inventory" className="hover:text-white transition-colors">Inventory</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Social</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><a href="#" className="hover:text-white transition-colors">Twitter / X</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2024 CaseHug. All rights reserved. This is a demo site for entertainment purposes only.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              18+ Only
            </span>
            <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Demo Site
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
