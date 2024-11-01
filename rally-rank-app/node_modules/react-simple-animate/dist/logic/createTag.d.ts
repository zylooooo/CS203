import { Keyframes } from '../types';
export default function createTag({ keyframes, animationName, }: {
    keyframes: Keyframes;
    animationName: string;
}): {
    styleTag: HTMLStyleElement;
    index: number;
};
