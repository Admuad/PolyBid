import { useEffect, useRef, MutableRefObject } from 'react';
import gsap from 'gsap';

/**
 * Custom hook for encryption animation
 * Animates a lock icon morphing and ciphertext bubble flying to blockchain
 */
export function useEncryptAnimation() {
  const lockRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const playEncryptAnimation = () => {
    const tl = gsap.timeline();

    // Lock icon pulse and morph
    if (lockRef.current) {
      tl.to(lockRef.current, {
        scale: 1.2,
        rotation: 10,
        duration: 0.3,
        ease: 'back.out(1.7)',
      })
        .to(lockRef.current, {
          scale: 1,
          rotation: 0,
          duration: 0.2,
        })
        .to(lockRef.current, {
          opacity: 0,
          scale: 0.5,
          duration: 0.2,
        });
    }

    // Ciphertext bubble emergence and flight
    if (bubbleRef.current) {
      tl.fromTo(
        bubbleRef.current,
        {
          opacity: 0,
          scale: 0,
          y: 0,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'back.out(1.7)',
        },
        '-=0.2'
      ).to(bubbleRef.current, {
        y: -200,
        x: 100,
        opacity: 0,
        scale: 0.5,
        duration: 1.2,
        ease: 'power2.inOut',
      });
    }

    return tl;
  };

  return { lockRef, bubbleRef, playEncryptAnimation };
}

/**
 * Custom hook for circular timer animation
 * Creates a circular SVG ring that depletes over time
 */
export function useTimerAnimation(
  timeRemaining: number,
  totalTime: number
): MutableRefObject<SVGCircleElement | null> {
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!circleRef.current || totalTime === 0) return;

    const progress = timeRemaining / totalTime;
    const circumference = 2 * Math.PI * 54; // radius = 54
    const offset = circumference * (1 - progress);

    gsap.to(circleRef.current, {
      strokeDashoffset: offset,
      duration: 1,
      ease: 'power1.out',
    });

    // Color transition when < 10 seconds
    if (timeRemaining < 10 && timeRemaining > 0) {
      gsap.to(circleRef.current, {
        stroke: '#ef4444',
        duration: 0.5,
      });

      // Heartbeat effect
      gsap.to(circleRef.current.parentElement, {
        scale: 1.05,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
      });
    }
  }, [timeRemaining, totalTime]);

  return circleRef;
}

/**
 * Custom hook for scroll-triggered reveal animations
 */
export function useScrollReveal(
  ref: MutableRefObject<HTMLElement | null>,
  options?: {
    delay?: number;
    y?: number;
    stagger?: number;
  }
) {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const children = element.children;

    if (children.length > 0 && options?.stagger) {
      // Stagger children
      gsap.fromTo(
        children,
        {
          y: options.y || 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: options.stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    } else {
      // Single element
      gsap.fromTo(
        element,
        {
          y: options?.y || 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: options?.delay || 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }
  }, [ref, options]);
}

/**
 * Custom hook for hero entrance animation
 */
export function useHeroAnimation() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline({ delay: 0.2 });
    const elements = heroRef.current.querySelectorAll('.hero-animate');

    tl.fromTo(
      elements[0], // Icon
      {
        scale: 0,
        rotation: -180,
        opacity: 0,
      },
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
      }
    )
      .fromTo(
        elements[1], // Title
        {
          y: 50,
          opacity: 0,
          filter: 'blur(10px)',
        },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
        },
        '-=0.4'
      )
      .fromTo(
        elements[2], // Subtitle
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.6'
      )
      .fromTo(
        elements[3], // CTA buttons
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        },
        '-=0.4'
      );
  }, []);

  return heroRef;
}

/**
 * Custom hook for card 3D tilt effect on hover
 */
export function useCardTilt(ref: MutableRefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Increased sensitivity from 10 to 15 for more responsive movement
      const rotateX = ((y - centerY) / centerY) * -15;
      const rotateY = ((x - centerX) / centerX) * 15;

      gsap.to(element, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        // Reduced duration from 0.3 to 0.1 for faster response
        duration: 0.1,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        // Reduced duration from 0.5 to 0.3 for quicker reset
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref]);
}

/**
 * Custom hook for winner reveal animation
 */
export function useWinnerReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  const playWinnerAnimation = (winnerIndex: number = 0) => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('.bid-card');
    const winnerCard = cards[winnerIndex];

    const tl = gsap.timeline();

    // Blur out non-winners
    cards.forEach((card, index) => {
      if (index !== winnerIndex) {
        tl.to(
          card,
          {
            opacity: 0.3,
            filter: 'blur(4px)',
            scale: 0.95,
            duration: 0.6,
            ease: 'power2.out',
          },
          0
        );
      }
    });

    // Winner card zoom with bounce
    if (winnerCard) {
      tl.to(
        winnerCard,
        {
          scale: 1.1,
          boxShadow: '0 0 40px rgba(0, 184, 163, 0.6)',
          duration: 0.8,
          ease: 'back.out(1.7)',
        },
        0.2
      );

      // Pulse glow effect
      tl.to(winnerCard, {
        boxShadow: '0 0 60px rgba(0, 184, 163, 0.8)',
        duration: 0.5,
        yoyo: true,
        repeat: 2,
        ease: 'power1.inOut',
      });
    }

    return tl;
  };

  return { containerRef, playWinnerAnimation };
}
