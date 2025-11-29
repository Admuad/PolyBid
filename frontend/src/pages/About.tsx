import { Shield, Lock, Zap, Code, ExternalLink, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DotGrid from '@/components/DotGrid';
import { LottieIcon } from '@/components/LottieIcon';
import helpAnimation from '@/assets/animations/help.json';

export function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen py-8 relative">
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
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-zama flex items-center justify-center mx-auto transform hover:scale-110 transition-transform">
                <Lock className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient-zama">
              About PolyBid
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A revolutionary sealed-bid auction system powered by Fully Homomorphic Encryption
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto space-y-12">
            {/* What is This */}
            <section className="card-zama">
              <h2 className="text-3xl font-bold mb-6 text-gradient-zama">
                What is PolyBid?
              </h2>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  PolyBid is a decentralized application (dApp) that enables <strong className="text-zama-primary">completely private auctions</strong> on
                  the Ethereum blockchain. Built for the <strong>Zama Builder Contest</strong>, this project demonstrates the power of
                  Fully Homomorphic Encryption (FHE) in creating privacy-preserving smart contracts.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Unlike traditional blockchain auctions where every bid is visible to all participants, our system uses
                  FHE to keep bid amounts encrypted throughout the auction process. The winner is determined through
                  mathematical operations on encrypted data, ensuring <strong className="text-zama-primary">complete privacy and fairness</strong>.
                </p>
              </div>
            </section>

            {/* Why Polynomial? */}
            <section className="card-zama bg-gradient-to-br from-zama-primary/10 to-transparent border-zama-primary/30">
              <h2 className="text-3xl font-bold mb-6 text-gradient-zama">
                Why "Polynomial"?
              </h2>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  The name <strong className="text-zama-primary">PolyBid</strong> is derived from <strong>polynomial</strong>,
                  the mathematical foundation of Fully Homomorphic Encryption (FHE).
                </p>
                <p className="text-gray-300 leading-relaxed">
                  FHE schemes like those used by Zama rely on <strong className="text-zama-primary">polynomial arithmetic</strong> over
                  encrypted data. When you submit a bid, it's encoded as coefficients in a polynomial ring. The smart contract
                  performs comparisons using polynomial operations like adding, multiplying, and evaluating polynomials all while
                  the data remains encrypted.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  This mathematical elegance allows us to compute on encrypted values without ever revealing them, making
                  truly private auctions possible. The "Poly" in PolyBid represents this powerful cryptographic foundation.
                </p>
              </div>
            </section>

            {/* Technology Stack */}
            <section className="card-zama">
              <h2 className="text-3xl font-bold mb-6 text-gradient-zama flex items-center gap-2">
                <Code className="w-8 h-8" />
                Technology Stack
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <TechItem
                  title="Smart Contracts"
                  items={[
                    'Solidity ^0.8.28',
                    'Zama FHE SDK (@fhevm)',
                    'Hardhat Development',
                    'Ethereum Sepolia Testnet',
                  ]}
                />
                <TechItem
                  title="Frontend"
                  items={[
                    'React 18 + TypeScript',
                    'React Router v7',
                    'TailwindCSS',
                    'Wagmi v2 + Viem',
                  ]}
                />
                <TechItem
                  title="Wallet Integration"
                  items={[
                    'RainbowKit',
                    'MetaMask Support',
                    'WalletConnect',
                    'Coinbase Wallet',
                  ]}
                />
                <TechItem
                  title="Animation & UI"
                  items={[
                    'GSAP Animations',
                    'Lenis Smooth Scroll',
                    'Radix UI Components',
                    'Lucide React Icons',
                  ]}
                />
              </div>
            </section>

            {/* How FHE Works */}
            <section className="card-zama">
              <h2 className="text-3xl font-bold mb-6 text-gradient-zama flex items-center gap-2">
                <Shield className="w-8 h-8" />
                How FHE Powers Privacy
              </h2>

              <div className="space-y-6">
                <div className="bg-black/30 rounded-lg p-6 border border-zama-primary/20">
                  <h3 className="text-xl font-semibold text-zama-primary mb-3">
                    1. Encryption
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    When you submit a bid, it's encrypted in your browser using Zama's FHE SDK. The encryption
                    happens client-side, so your bid amount never leaves your device in plaintext.
                  </p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-zama-primary/20">
                  <h3 className="text-xl font-semibold text-zama-primary mb-3">
                    2. On-Chain Storage
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Encrypted bids are submitted to the smart contract and stored on the Ethereum blockchain.
                    No one can decrypt these values - not the contract owner, not other bidders, not even miners.
                  </p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-zama-primary/20">
                  <h3 className="text-xl font-semibold text-zama-primary mb-3">
                    3. Homomorphic Comparison
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    The magic of FHE: the smart contract can compare encrypted bids without decrypting them.
                    Using homomorphic operations, it determines which encrypted bid is the highest.
                  </p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-zama-primary/20">
                  <h3 className="text-xl font-semibold text-zama-primary mb-3">
                    4. Winner Reveal
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    After the auction ends, the winning bid can be securely decrypted and the winner announced.
                    The entire process is verifiable on-chain while maintaining privacy.
                  </p>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="card-zama">
              <h2 className="text-3xl font-bold mb-6 text-gradient-zama flex items-center gap-2">
                <Zap className="w-8 h-8" />
                Key Features
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <Feature
                  icon={<Lock className="w-5 h-5" />}
                  title="Complete Privacy"
                  description="Bid amounts remain encrypted until reveal"
                />
                <Feature
                  icon={<Shield className="w-5 h-5" />}
                  title="Trustless System"
                  description="No intermediaries or trusted parties needed"
                />
                <Feature
                  icon={<Zap className="w-5 h-5" />}
                  title="On-Chain Verification"
                  description="All operations verifiable on Ethereum"
                />
                <Feature
                  icon={<Code className="w-5 h-5" />}
                  title="Open Source"
                  description="Fully transparent and auditable code"
                />
              </div>
            </section>

            {/* Get Test ETH - Faucet Section */}
            <section className="card-zama bg-gradient-to-r from-zama-primary/20 to-zama-primary/10 border-zama-primary">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-4 text-white">
                  🚰 Get Test ETH for Sepolia
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  You'll need Sepolia testnet ETH to interact with PolyBid. Get free test ETH from these faucets:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all group cursor-target border border-zama-primary/30 hover:border-zama-primary"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1 group-hover:text-zama-primary transition-colors">
                        Google Cloud Faucet
                      </h3>
                      <p className="text-sm text-gray-400">Fast and reliable</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-zama-primary" />
                  </div>
                </a>

                <a
                  href="https://www.alchemy.com/faucets/ethereum-sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all group cursor-target border border-zama-primary/30 hover:border-zama-primary"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1 group-hover:text-zama-primary transition-colors">
                        Alchemy Faucet
                      </h3>
                      <p className="text-sm text-gray-400">No login required</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-zama-primary" />
                  </div>
                </a>

                <a
                  href="https://www.infura.io/faucet/sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all group cursor-target border border-zama-primary/30 hover:border-zama-primary"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1 group-hover:text-zama-primary transition-colors">
                        Infura Faucet
                      </h3>
                      <p className="text-sm text-gray-400">Trusted provider</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-zama-primary" />
                  </div>
                </a>

                <a
                  href="https://faucet.quicknode.com/ethereum/sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all group cursor-target border border-zama-primary/30 hover:border-zama-primary"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1 group-hover:text-zama-primary transition-colors">
                        QuickNode Faucet
                      </h3>
                      <p className="text-sm text-gray-400">Quick delivery</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-zama-primary" />
                  </div>
                </a>
              </div>

              <div className="mt-6 p-4 bg-black/30 rounded-lg border border-zama-primary/20">
                <p className="text-sm text-gray-400">
                  <strong className="text-zama-primary">💡 Tip:</strong> If one faucet is rate-limited, try another!
                  Most faucets require you to wait 24 hours between requests.
                </p>
              </div>
            </section>

            {/* Getting Started Guide */}
            <section className="card-zama">
              <h2 className="text-3xl font-bold mb-6 text-gradient-zama">
                Getting Started
              </h2>

              <div className="space-y-4">
                <div className="bg-black/30 rounded-lg p-5 border border-zama-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-zama-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Install MetaMask</h3>
                      <p className="text-gray-400 text-sm">
                        Download and install MetaMask browser extension from{' '}
                        <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-zama-primary hover:underline">
                          metamask.io
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-5 border border-zama-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-zama-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Switch to Sepolia Network</h3>
                      <p className="text-gray-400 text-sm">
                        PolyBid will automatically switch you to Sepolia when you connect your wallet.
                        If not, manually select "Sepolia test network" in MetaMask.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-5 border border-zama-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-zama-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Get Test ETH</h3>
                      <p className="text-gray-400 text-sm">
                        Use any of the faucets above to get free Sepolia ETH. You'll need it for gas fees.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-5 border border-zama-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-zama-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Start Bidding!</h3>
                      <p className="text-gray-400 text-sm">
                        Connect your wallet, browse auctions, and place encrypted bids. Your bid amounts remain private!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="card-zama">
              <h2 className="text-3xl font-bold mb-6 text-gradient-zama flex items-center gap-3">
                <LottieIcon
                  animationData={helpAnimation}
                  width={40}
                  height={40}
                  loop={true}
                  autoplay={true}
                  color="white"
                />
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                <FAQItem
                  question="How does FHE keep my bids private?"
                  answer="Your bid is encrypted in your browser before being sent to the blockchain. The smart contract can compare encrypted bids using polynomial operations without ever decrypting them. Only you can decrypt your own bid result."
                />
                <FAQItem
                  question="Can I see other people's bids?"
                  answer="No! All bids are encrypted using FHE. You can only see your own bid and whether you won after the auction ends. This ensures a fair, sealed-bid auction."
                />
                <FAQItem
                  question="What happens if I lose the auction?"
                  answer="You can withdraw your bid deposit after the auction ends. The smart contract automatically handles refunds for non-winning bidders."
                />
                <FAQItem
                  question="Is this on mainnet?"
                  answer="No, PolyBid currently runs on Sepolia testnet for demonstration purposes. This allows you to test the platform without risking real funds."
                />
                <FAQItem
                  question="Why am I being switched to Sepolia automatically?"
                  answer="For your safety! PolyBid only works on Sepolia testnet. Auto-switching prevents you from accidentally using real ETH on the wrong network."
                />
              </div>
            </section>

            {/* Links */}
            <section className="card-zama bg-gradient-zama">
              <h2 className="text-3xl font-bold mb-6 text-white">
                Learn More
              </h2>

              <div className="space-y-4">
                <ExternalLinkItem
                  href="https://docs.zama.ai/"
                  title="Zama Documentation"
                  description="Learn about Fully Homomorphic Encryption"
                />
                <ExternalLinkItem
                  href="https://github.com/zama-ai"
                  title="Zama GitHub"
                  description="Explore Zama's open-source FHE tools"
                />
                <ExternalLinkItem
                  href="https://www.zama.ai/"
                  title="Zama Website"
                  description="Discover the future of privacy in blockchain"
                />
              </div>
            </section>

            {/* Creator Info */}
            <section className="card-zama text-center">
              <h2 className="text-3xl font-bold mb-4 text-gradient-zama">
                Created by Admuad
              </h2>
              <p className="text-gray-300 mb-6">
                <strong className="text-zama-primary">Muhammed Adediran</strong>
              </p>
              <p className="text-sm text-gray-400">
                This project demonstrates the practical application of Fully Homomorphic Encryption
                in creating privacy-preserving decentralized applications.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TechItemProps {
  title: string;
  items: string[];
}

function TechItem({ title, items }: TechItemProps) {
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-zama-primary/20">
      <h3 className="font-semibold text-white mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zama-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-zama-primary/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-zama-primary/20 flex items-center justify-center text-zama-primary flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

interface ExternalLinkItemProps {
  href: string;
  title: string;
  description: string;
}

function ExternalLinkItem({ href, title, description }: ExternalLinkItemProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors group cursor-target"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white mb-1 group-hover:text-zama-light transition-colors">
            {title}
          </h3>
          <p className="text-sm text-white/80">{description}</p>
        </div>
        <ExternalLink className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
      </div>
    </a>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-black/30 rounded-lg border border-zama-primary/20 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left cursor-target group hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-white group-hover:text-zama-primary transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180 text-zama-primary' : ''
            }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} // Slow, smooth easing
          >
            <div className="px-5 pb-5">
              <p className="text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-3">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
