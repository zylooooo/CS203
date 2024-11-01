import * as React from 'react';
import { Sequences, AnimationProps, AnimateKeyframesProps } from './types';
export interface Props {
    play: boolean;
    sequences?: Sequences;
    children?: any;
}
declare type SequenceId = number | string;
declare type PartialSequence = {
    play: boolean;
    pause: boolean;
    delay: number;
    controlled: boolean;
};
declare type AnimationStates = Record<SequenceId, PartialSequence>;
declare type Register = (data: AnimationProps | AnimateKeyframesProps) => void;
interface IAnimationContext {
    animationStates: AnimationStates;
    register: Register;
}
export declare const AnimateContext: React.Context<IAnimationContext>;
export default function AnimateGroup({ play, sequences, children, }: Props): React.ReactElement;
export {};
