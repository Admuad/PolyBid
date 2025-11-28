import { Plus } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingFABProps {
    onClick: () => void;
    disabled?: boolean;
    label?: string;
}

export function FloatingFAB({ onClick, disabled = false, label = 'Create Auction' }: FloatingFABProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const threshold = 50; // Minimum scroll difference to trigger change

                    // Only trigger if scroll difference is significant
                    if (Math.abs(currentScrollY - lastScrollY.current) > threshold) {
                        if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
                            // Scrolling down significantly -> shrink
                            setIsScrolled(true);
                        } else if (currentScrollY < lastScrollY.current) {
                            // Scrolling up -> expand
                            setIsScrolled(false);
                        }
                        lastScrollY.current = currentScrollY;
                    }

                    ticking.current = false;
                });

                ticking.current = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
        fixed bottom-8 right-6 md:bottom-10 md:right-10 z-[9999]
        bg-gradient-zama hover:shadow-2xl hover:shadow-zama-primary/50
        text-white font-semibold
        rounded-full
        flex items-center justify-center gap-3
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        shadow-lg shadow-zama-primary/30
        active:scale-95
        touch-manipulation
        cursor-target
      `}
            animate={{
                width: isScrolled ? '56px' : 'auto',
                paddingLeft: isScrolled ? '0px' : '24px',
                paddingRight: isScrolled ? '0px' : '24px',
                paddingTop: '16px',
                paddingBottom: '16px',
            }}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
        >
            <Plus className="w-6 h-6 flex-shrink-0" />
            <AnimatePresence mode="wait">
                {!isScrolled && (
                    <motion.span
                        className="font-semibold whitespace-nowrap text-sm overflow-hidden"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
