import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t mt-16" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-[1136px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff7a18, #7c3aed)' }}>
                <span className="text-white font-black text-xs">CD</span>
              </div>
              <span className="font-black text-lg">case<span className="gradient-text">devo</span></span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              En iyi CS2 kasa açma deneyimi. Kasaları aç, skin kazan ve arkadaşlarınla takas yap.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Oyunlar</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><Link href="/" className="hover:text-white transition-colors">Kasalar</Link></li>
              <li><Link href="/upgrade" className="hover:text-white transition-colors">Yükselt</Link></li>
              <li><Link href="/battle" className="hover:text-white transition-colors">Kasa Savaşı</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Bilgi</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><Link href="/provably-fair" className="hover:text-white transition-colors">Provably Fair</Link></li>
              <li><Link href="/inventory" className="hover:text-white transition-colors">Envanter</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a></li>
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
            © 2024 Casedevo. Tüm hakları saklıdır. Bu site yalnızca eğlence amaçlı bir demodur.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              18+ Özel
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
