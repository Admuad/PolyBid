import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Gavel, History, Info, Lock, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const CustomMenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-menu"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

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
            <NavLink to="/" icon={<Home className="w-4 h-4" />} active={isActive('/')}>
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
            <NavLink to="/about" icon={<Info className="w-4 h-4" />} active={isActive('/about')}>
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
              {isOpen ? <X className="w-6 h-6" /> : <CustomMenuIcon />}
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
              <MobileNavLink to="/" icon={<Home className="w-4 h-4" />} active={isActive('/')} onClick={closeMenu}>
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
              <MobileNavLink to="/about" icon={<Info className="w-4 h-4" />} active={isActive('/about')} onClick={closeMenu}>
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
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ to, icon, active, children }: NavLinkProps) {
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
        <span className="relative z-10">{icon}</span>
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

function MobileNavLink({ to, icon, active, children, onClick }: NavLinkProps) {
  return (
    <Link to={to} onClick={onClick} className="block w-full">
      <motion.div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative overflow-hidden cursor-target w-full ${active
          ? 'bg-zama-primary text-white'
          : 'text-gray-300 hover:bg-white/5'
          }`}
        whileTap={{ scale: 0.98 }}
      >
        {/* Content */}
        <span className="relative z-10">{icon}</span>
        <span className="font-medium relative z-10">{children}</span>
      </motion.div>
    </Link>
  );
}
