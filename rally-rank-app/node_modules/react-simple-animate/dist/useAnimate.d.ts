import * as React from 'react';
import { AnimationProps } from './types';
declare type UseAnimateProps = Pick<AnimationProps, 'start' | 'end' | 'complete' | 'onComplete' | 'delay' | 'duration' | 'easeType'>;
export default function useAnimate(props: UseAnimateProps): {
    isPlaying: boolean;
    style: React.CSSProperties;
    play: (isPlaying: boolean) => void;
};
export {};
