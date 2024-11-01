import * as React from 'react';
import { StateMachineContextValue } from './types';
declare type PropsChildren = {
    children?: React.ReactNode;
};
export declare const StateMachineProvider: React.FC<PropsChildren>;
export declare const useStateMachineContext: () => StateMachineContextValue;
export {};
