import * as React from 'react';
import { HookSequences } from './types';
interface Props {
    sequences: HookSequences;
}
export default function useAnimateGroup(props: Props): {
    styles: (React.CSSProperties | undefined)[];
    play: (boolean: any) => void;
    isPlaying: boolean;
};
export {};
