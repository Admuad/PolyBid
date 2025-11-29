import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gavel, History, Lock, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Lottie from 'lottie-react';
import { LottieIcon } from './LottieIcon';
import homeAnimation from '@/assets/animations/home.json';
import infoAnimation from '@/assets/animations/info.json';
import menuV2Animation from '@/assets/animations/menuV2.json';

const MobileMenuIcon = ({ isOpen }: { isOpen: boolean }) => {
  const lottieRef = useRef<any>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (lottieRef.current) {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        // Don't play on mount, just set initial frame if needed
        if (isOpen) {
          lottieRef.current.goToAndStop(lottieRef.current.getDuration(true), true);
        } else {
          lottieRef.current.goToAndStop(0, true);
        }
        return;
      }

      lottieRef.current.setSpeed(isOpen ? 1 : -1);
      lottieRef.current.play();
    }
  }, [isOpen]);

  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <Lottie
        lottieRef={lottieRef}
        animationData={menuV2Animation}
        loop={false}
        autoplay={false}
        style={{ width: '100%', height: '100%', filter: 'invert(1)' }} // White color
      />
    </div>
  );
};

export function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism-dark border-b border-zama-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group cursor-target" onClick={closeMenu}>
            <div className="w-12 h-12 rounded-lg bg-gradient-zama flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-zama">PolyBid</h1>
              <p className="text-xs text-gray-400">Polynomial Encryption</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink to="/" animationData={homeAnimation} active={isActive('/')}>
              Home
            </NavLink>
            <NavLink to="/marketplace" icon={<Gavel className="w-4 h-4" />} active={isActive('/marketplace')}>
              Marketplace
            </NavLink>
            <NavLink to="/bids" icon={<History className="w-4 h-4" />} active={isActive('/bids')}>
              Bid History
            </NavLink>
            <NavLink to="/profile" icon={<User className="w-4 h-4" />} active={isActive('/profile')}>
              Profile
            </NavLink>
            <NavLink to="/about" animationData={infoAnimation} active={isActive('/about')}>
              About
            </NavLink>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-4">
            {/* Wallet Connect */}
            <div className="rainbowkit-container cursor-target">
              <ConnectButton
                showBalance={false}
                chainStatus="none"
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-target"
              aria-label="Toggle menu"
            >
              <MobileMenuIcon isOpen={isOpen} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-zama-primary/20 glass-morphism-dark overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <MobileNavLink to="/" animationData={homeAnimation} active={isActive('/')} onClick={closeMenu}>
                Home
              </MobileNavLink>
              <MobileNavLink to="/marketplace" icon={<Gavel className="w-4 h-4" />} active={isActive('/marketplace')} onClick={closeMenu}>
                Marketplace
              </MobileNavLink>
              <MobileNavLink to="/bids" icon={<History className="w-4 h-4" />} active={isActive('/bids')} onClick={closeMenu}>
                Bid History
              </MobileNavLink>
              <MobileNavLink to="/profile" icon={<User className="w-4 h-4" />} active={isActive('/profile')} onClick={closeMenu}>
                Profile
              </MobileNavLink>
              <MobileNavLink to="/about" animationData={infoAnimation} active={isActive('/about')} onClick={closeMenu}>
                About
              </MobileNavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

interface NavLinkProps {
  to: string;
  icon?: React.ReactNode;
  animationData?: any;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ to, icon, animationData, active, children }: NavLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={to}>
      <motion.div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative overflow-hidden cursor-target ${active
          ? 'bg-zama-primary text-white'
          : 'text-gray-300 hover:bg-zama-primary/20 hover:text-zama-primary'
          }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Active indicator */}
        {active && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-zama-primary to-zama-primary-dark"
            layoutId="activeNav"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center h-5 w-5">
          {animationData ? (
            <LottieIcon
              animationData={animationData}
              width={20}
              height={20}
              isHovered={isHovered}
              loop={false}
              color="white"
            />
          ) : (
            icon
          )}
        </span>
        <span className="font-medium relative z-10">{children}</span>

        {/* Hover shine effect */}
        {!active && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-zama-primary/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.div>
    </Link>
  );
}

function MobileNavLink({ to, icon, animationData, active, children, onClick }: NavLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={to} onClick={onClick} className="block w-full">
      <motion.div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative overflow-hidden cursor-target w-full ${active
          ? 'bg-zama-primary text-white'
          : 'text-gray-300 hover:bg-white/5'
          }`}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center h-5 w-5">
          {animationData ? (
            <LottieIcon
              animationData={animationData}
              width={20}
              height={20}
              isHovered={isHovered}
              loop={false}
              color="white"
            />
          ) : (
            icon
          )}
        </span>
        <span className="font-medium relative z-10">{children}</span>
      </motion.div>
    </Link>
  );
}
