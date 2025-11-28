import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Page transition wrapper with Framer Motion
 * Implements slide up/fade with accent color flash
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02,
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: [0.43, 0.13, 0.23, 0.96],
    duration: 0.4,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {/* Accent flash effect */}
        <motion.div
          className="fixed inset-0 bg-zama-primary pointer-events-none z-50"
          initial={{ opacity: 0.1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.15, delay: 0.1 }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Stagger container for list animations
 */
export function StaggerContainer({ children }: { children: ReactNode }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

/**
 * Individual item for stagger animations
 */
export function StaggerItem({ children }: { children: ReactNode }) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return <motion.div variants={itemVariants}>{children}</motion.div>;
}

/**
 * Scale and fade animation for modals/dialogs
 */
export function ScaleFade({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide in from direction
 */
interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
}

export function SlideIn({ children, direction = 'bottom' }: SlideInProps) {
  const directionOffset = {
    left: { x: -100, y: 0 },
    right: { x: 100, y: 0 },
    top: { x: 0, y: -100 },
    bottom: { x: 0, y: 100 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      exit={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
    >
      {children}
    </motion.div>
  );
}
