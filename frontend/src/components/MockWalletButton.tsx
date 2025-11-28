import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export function MockWalletButton() {
  const [isConnected, setIsConnected] = useState(false);
  const mockAddress = '0x1234...5678';

  return (
    <motion.button
      onClick={() => setIsConnected(!isConnected)}
      className="px-4 py-2 rounded-lg bg-zama-primary hover:bg-zama-primary-hover text-white font-semibold flex items-center gap-2 transition-all"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Wallet className="w-4 h-4" />
      {isConnected ? mockAddress : 'Connect Wallet (Demo)'}
    </motion.button>
  );
}
