import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { useTimerAnimation } from '@/hooks/useAnimations';

interface AuctionTimerProps {
  endTime: number;
  onExpire?: () => void;
}

export function AuctionTimer({ endTime, onExpire }: AuctionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime] = useState(3600); // Assume 1 hour total for animation
  const circleRef = useTimerAnimation(timeRemaining, totalTime);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);

      if (remaining === 0 && onExpire) {
        setTimeout(() => {
          onExpire();
        }, 1000);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  const isExpiring = timeRemaining > 0 && timeRemaining < 300; // Last 5 minutes
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center justify-center gap-8">
      {/* Circular Timer Ring */}
      <div className="relative">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            ref={circleRef}
            cx="60"
            cy="60"
            r={radius}
            stroke="#00B8A3"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              transition: 'stroke 0.5s ease',
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock
            className={`w-12 h-12 ${isExpiring ? 'text-red-500' : 'text-zama-primary'}`}
          />
        </div>
      </div>

      {/* Time Display */}
      <div className="flex flex-col">
        <span className="text-sm text-gray-400 mb-1">Time Remaining</span>
        <span
          className={`text-4xl font-mono font-bold ${
            isExpiring ? 'text-red-500 animate-pulse' : 'text-zama-primary'
          }`}
        >
          {timeRemaining > 0 ? formatTime(timeRemaining) : 'Expired'}
        </span>
      </div>
    </div>
  );
}
