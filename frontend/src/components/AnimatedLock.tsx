import { motion } from 'framer-motion';
import { Lock, LockOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AnimatedLock() {
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        // Start unlocked, then lock after a short delay
        const timer = setTimeout(() => {
            setIsLocked(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 1, scale: 1 }}
                animate={{
                    opacity: isLocked ? 0 : 1,
                    scale: isLocked ? 0.8 : 1,
                    rotate: isLocked ? 0 : -10
                }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <LockOpen className="w-full h-full text-zama-primary" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: isLocked ? 1 : 0,
                    scale: isLocked ? 1 : 1.2,
                    rotate: isLocked ? 0 : 10
                }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Lock className="w-full h-full text-zama-primary" />
            </motion.div>
        </div>
    );
}
