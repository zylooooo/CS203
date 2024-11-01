import * as React from 'react';
import { AnimateKeyframesProps } from './types';
declare type UseAnimationKeyframesProps = Pick<AnimateKeyframesProps, 'duration' | 'delay' | 'easeType' | 'direction' | 'fillMode' | 'iterationCount' | 'keyframes'>;
export default function useAnimateKeyframes(props: UseAnimationKeyframesProps): {
    style: React.CSSProperties;
    play: (isPlaying: boolean) => void;
    pause: (isPaused: boolean) => void;
    isPlaying: boolean;
};
export {};
