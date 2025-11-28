import { Github, Twitter, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-0 border-t border-zama-primary/20 bg-black/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-zama flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gradient-zama">PolyBid</h3>
                <p className="text-xs text-gray-500">Powered by Polynomial FHE</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Privacy-preserving auctions using Fully Homomorphic Encryption.
              Built for the Zama Builder Contest.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-gray-400 hover:text-zama-primary transition-colors cursor-target">
                  Home
                </a>
              </li>
              <li>
                <a href="/auction" className="text-sm text-gray-400 hover:text-zama-primary transition-colors cursor-target">
                  Auction
                </a>
              </li>
              <li>
                <a href="/about" className="text-sm text-gray-400 hover:text-zama-primary transition-colors cursor-target">
                  About
                </a>
              </li>
              <li>
                <a
                  href="https://docs.zama.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-zama-primary transition-colors cursor-target"
                >
                  Zama Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="flex gap-4">
              <a
                href="https://github.com/Admuad"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-zama-primary/20 flex items-center justify-center transition-colors group cursor-target"
              >
                <Github className="w-5 h-5 text-gray-400 group-hover:text-zama-primary" />
              </a>
              <a
                href="https://x.com/Adedir2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-zama-primary/20 flex items-center justify-center transition-colors group cursor-target"
              >
                <Twitter className="w-5 h-5 text-gray-400 group-hover:text-zama-primary" />
              </a>
            </div>
            <div className="mt-6">
              <a
                href="https://www.zama.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block cursor-target"
              >
                <img
                  src="/zama-logo.svg"
                  alt="Powered by Zama"
                  className="h-8 opacity-60 hover:opacity-100 transition-opacity"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            © 2025 PolyBid. Built with 💚 using Zama's FHE technology.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Developed by Admuad (Muhammed Adediran) for the Zama Builder Contest
          </p>
        </div>
      </div>
    </footer>
  );
}