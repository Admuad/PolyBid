import { Trophy, Sparkles, User, PartyPopper } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';

interface WinnerRevealProps {
  winner: string; // Not displayed for privacy, but kept for future extensibility
  className?: string;
}

export function WinnerReveal({ winner: _winner, className = '' }: WinnerRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const trophyRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Winner reveal animation sequence
    const tl = gsap.timeline({
      onComplete: () => setShowConfetti(true),
    });

    if (cardRef.current && trophyRef.current) {
      // Card entrance with bounce
      tl.fromTo(
        cardRef.current,
        {
          scale: 0.8,
          opacity: 0,
          y: 50,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'back.out(1.7)',
        }
      )
        // Trophy bounce and glow
        .fromTo(
          trophyRef.current,
          {
            scale: 0,
            rotation: -180,
          },
          {
            scale: 1,
            rotation: 0,
            duration: 1,
            ease: 'elastic.out(1, 0.5)',
          },
          '-=0.5'
        )
        // Pulsing glow effect
        .to(trophyRef.current, {
          scale: 1.1,
          duration: 0.5,
          yoyo: true,
          repeat: 3,
          ease: 'power1.inOut',
        })
        .call(() => setRevealed(true), [], '-=1');

      // Card continuous subtle glow
      gsap.to(cardRef.current, {
        boxShadow:
          '0 0 40px rgba(0, 184, 163, 0.4), 0 0 80px rgba(0, 184, 163, 0.2)',
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut',
      });
    }

    return () => {
      tl.kill();
      if (cardRef.current) gsap.killTweensOf(cardRef.current);
    };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className={`card-zama border-2 border-zama-primary relative overflow-hidden ${className}`}
      style={{ willChange: 'box-shadow, transform' }}
    >
      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-zama-primary rounded-full"
              initial={{
                x: '50%',
                y: '20%',
                opacity: 1,
              }}
              animate={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100 + 100}%`,
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                ease: 'easeOut',
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}

      {/* Gradient overlay animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-zama-primary/10 via-transparent to-transparent opacity-50" />

      <div className="text-center relative z-10">
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-4 bg-zama-primary/20 rounded-full blur-xl animate-pulse" />
          <Trophy ref={trophyRef} className="w-20 h-20 text-zama-primary relative z-10" />
        </div>

        <motion.h2
          className="text-3xl font-bold mb-2 text-gradient-zama"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          🎉 Winner Announced! 🎉
        </motion.h2>

        <motion.div
          className="mt-6 p-6 bg-black/40 rounded-lg border border-zama-primary/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-sm text-gray-400 mb-2">Winning Address</p>
          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: 'backOut' }}
          >
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-zama flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <User className="w-6 h-6 text-white" />
            </motion.div>
            <div className="text-left">
              <p className="font-mono text-lg text-zama-primary font-bold">
                🔒 Anon Winner
              </p>
              <p className="text-xs text-gray-500">Identity Protected by FHE</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <Sparkles className="w-4 h-4 text-zama-primary animate-pulse" />
          <span>Verified through FHE decryption</span>
          <PartyPopper className="w-4 h-4 text-zama-primary" />
        </motion.div>

        <motion.div
          className="mt-4 p-4 bg-zama-primary/10 border border-zama-primary/30 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <p className="text-xs text-gray-400">
            The winning bid was determined through homomorphic comparison of all encrypted bids,
            ensuring complete privacy until reveal.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
