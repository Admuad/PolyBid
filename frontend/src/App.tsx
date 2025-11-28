import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { config } from './config/wagmi';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { PageTransition } from './components/PageTransition';
import TargetCursor from './components/TargetCursor';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
// import { Auction } from './pages/Auction';
import { BidHistory } from './pages/BidHistory';
import { About } from './pages/About';
import { ActiveAuctionsPage } from './pages/ActiveAuctionsPage';
import { CompletedAuctionsPage } from './pages/CompletedAuctionsPage';
import { Profile } from './pages/Profile';
import { useNetworkGuard } from './hooks/useNetworkGuard';
import { Toaster } from 'react-hot-toast';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const queryClient = new QueryClient();

function NetworkGuardWrapper({ children }: { children: React.ReactNode }) {
  useNetworkGuard(); // Auto-switch to Sepolia on wallet connect
  return <>{children}</>;
}

function App() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    // Expose Lenis instance globally for modal scroll control
    (window as any).lenisInstance = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      delete (window as any).lenisInstance;
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00B8A3',
            accentColorForeground: '#111111',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          <NetworkGuardWrapper>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #00B8A3',
                },
                success: {
                  iconTheme: {
                    primary: '#00B8A3',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <BrowserRouter>
              <div className="min-h-screen bg-zama-dark text-white" id="app-root">
                <TargetCursor spinDuration={2} hideDefaultCursor={true} parallaxOn={true} />
                <Navigation />
                <main className="pt-20">
                  <Routes>
                    <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                    <Route path="/marketplace" element={<PageTransition><Marketplace /></PageTransition>} />
                    <Route path="/marketplace/active" element={<ActiveAuctionsPage />} />
                    <Route path="/marketplace/completed" element={<CompletedAuctionsPage />} />
                    <Route path="/auction" element={<PageTransition><Marketplace /></PageTransition>} />
                    <Route path="/auction/:id" element={<Navigate to="/marketplace" replace />} />
                    <Route path="/bids" element={<PageTransition><BidHistory /></PageTransition>} />
                    <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                    <Route path="/about" element={<PageTransition><About /></PageTransition>} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </NetworkGuardWrapper>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;