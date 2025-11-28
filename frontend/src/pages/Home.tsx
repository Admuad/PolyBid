import { Link } from 'react-router-dom';
import { Lock, Shield, Eye, Zap, ArrowRight } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { useHeroAnimation, useScrollReveal, useCardTilt } from '@/hooks/useAnimations';
import TextType from '@/components/TextType';
import DotGrid from '@/components/DotGrid';

export function Home() {
  const heroRef = useHeroAnimation();
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useScrollReveal(featuresRef, { stagger: 0.15, y: 60 });
  useScrollReveal(stepsRef, { stagger: 0.2, y: 40 });

  return (
    <div className="min-h-screen relative">
      {/* Full-page DotGrid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotGrid
          dotSize={5}
          gap={12}
          baseColor="#00B8A3"
          activeColor="#00B8A3"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
          style={{ opacity: 0.3, height: '100vh', width: '100%' }}
        />
      </div>

      {/* Content with relative positioning */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-radial from-zama-primary/10 via-transparent to-transparent" />

          <div className="container mx-auto px-4 relative z-10" ref={heroRef}>
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8 inline-block hero-animate">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-zama flex items-center justify-center transform hover:scale-110 transition-transform">
                  <Lock className="w-12 h-12 text-white" />
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 hero-animate whitespace-normal md:whitespace-nowrap">
                PolyBid with{' '}
                <span className="text-gradient-zama inline">
                  <TextType
                    text={['FHE', 'ZAMA']}
                    typingSpeed={150}
                    deletingSpeed={100}
                    pauseDuration={2000}
                    showCursor={false}
                    loop={true}
                    className="inline"
                  />
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto hero-animate">
                Experience the future of <span className="text-zama-primary font-semibold">sealed-bid auctions</span> powered by Polynomial-based Fully Homomorphic Encryption.
                Your bids remain encrypted until the auction ends.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center hero-animate">
                <Link to="/marketplace" className="btn-zama text-lg px-8 py-4 inline-flex items-center gap-2 cursor-target">
                  Enter Auction <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 rounded-lg border-2 border-zama-primary text-zama-primary hover:bg-zama-primary hover:text-white font-semibold transition-all inline-flex items-center gap-2 cursor-target"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-black/30">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 text-gradient-zama">
              <TextType
                text={['Why Choose FHE Auctions?']}
                typingSpeed={80}
                deletingSpeed={50}
                pauseDuration={3000}
                showCursor={false}
                loop={false}
                resetOnScroll={true}
                className=""
              />
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" ref={featuresRef}>
              <FeatureCard
                icon={<Lock className="w-8 h-8" />}
                title="Complete Privacy"
                description="Bids are encrypted using FHE. No one can see your bid amount, not even the contract."
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8" />}
                title="Trustless"
                description="Smart contract handles everything. No intermediaries or trusted parties required."
              />
              <FeatureCard
                icon={<Eye className="w-8 h-8" />}
                title="Fair Reveal"
                description="Winner is determined through homomorphic operations, ensuring fairness."
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="On-chain"
                description="All operations verified on Ethereum Sepolia. Transparent and verifiable."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-black/60">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 text-gradient-zama">
              How It Works
            </h2>

            <div className="max-w-4xl mx-auto space-y-8" ref={stepsRef}>
              <Step
                number="1"
                title="Connect Your Wallet"
                description="Connect your MetaMask or any Web3 wallet to the Sepolia testnet."
              />
              <Step
                number="2"
                title="Submit Encrypted Bid"
                description="Enter your bid amount. It will be encrypted using FHE before submission."
              />
              <Step
                number="3"
                title="Wait for Auction End"
                description="All bids remain encrypted and hidden during the auction period."
              />
              <Step
                number="4"
                title="Winner Revealed"
                description="The highest bid is determined through homomorphic comparison and the winner is announced."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-zama-primary/30 to-zama-primary/20 mb-0">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Experience PolyBid?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join the revolution in privacy-preserving blockchain technology with Zama's FHE.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zama-primary rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors cursor-target"
            >
              Start Bidding <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useCardTilt(cardRef);

  return (
    <div
      ref={cardRef}
      className="card-zama hover:border-zama-primary/50 transition-all group hover:shadow-[0_0_30px_rgba(0,184,163,0.2)] cursor-target"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="w-16 h-16 rounded-lg bg-zama-primary/20 flex items-center justify-center mb-4 group-hover:bg-zama-primary/30 transition-colors group-hover:scale-110 duration-300 group-hover:shadow-[0_0_20px_rgba(0,184,163,0.3)]">
        <div className="text-zama-primary">{icon}</div>
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

interface StepProps {
  number: string;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-zama flex items-center justify-center text-white font-bold text-xl">
        {number}
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}