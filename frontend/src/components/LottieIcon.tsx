import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { CSSProperties, useRef, useEffect } from 'react';

interface LottieIconProps {
    animationData: any;
    width?: number;
    height?: number;
    loop?: boolean;
    autoplay?: boolean;
    className?: string;
    style?: CSSProperties;
    color?: 'white' | 'primary' | 'inherit';
    playOnHover?: boolean;
    playOnClick?: boolean;
    isHovered?: boolean;
}

export function LottieIcon({
    animationData,
    width = 24,
    height = 24,
    loop = false,
    autoplay = false,
    className = '',
    style = {},
    color = 'white',
    playOnHover = false,
    playOnClick = false,
    isHovered: externalIsHovered,
}: LottieIconProps) {
    const lottieRef = useRef<LottieRefCurrentProps>(null);


    // Handle external hover changes
    useEffect(() => {
        if (externalIsHovered !== undefined && lottieRef.current) {
            if (externalIsHovered) {
                lottieRef.current.setDirection(1);
                lottieRef.current.play();
            } else if (!loop) {
                lottieRef.current.setDirection(-1);
                lottieRef.current.play();
            }
        }
    }, [externalIsHovered, loop]);

    const handleMouseEnter = () => {
        if (playOnHover && lottieRef.current) {
            lottieRef.current.stop();
            lottieRef.current.play();
        }
    };

    const handleMouseLeave = () => {
        if (playOnHover && lottieRef.current && !loop) {
            // Reset to first frame after animation completes
            setTimeout(() => {
                if (lottieRef.current) {
                    lottieRef.current.goToAndStop(0, true);
                }
            }, 1000);
        }
    };

    const handleClick = () => {
        if (playOnClick && lottieRef.current) {
            lottieRef.current.stop();
            lottieRef.current.play();
        }
    };

    // CSS filter to change color
    const colorFilter = color === 'white'
        ? 'brightness(0) invert(1)'
        : color === 'primary'
            ? 'brightness(0) saturate(100%) invert(64%) sepia(98%) saturate(2270%) hue-rotate(76deg) brightness(101%) contrast(101%)'
            : 'none';

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{ width, height, display: 'inline-block' }}
            className={className}
        >
            <Lottie
                lottieRef={lottieRef}
                animationData={animationData}
                loop={loop}
                autoplay={autoplay}
                style={{
                    width,
                    height,
                    filter: colorFilter,
                    ...style
                }}
            />
        </div>
    );
}
