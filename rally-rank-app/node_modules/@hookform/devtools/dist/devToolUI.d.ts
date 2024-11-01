import * as React from 'react';
import { Control } from 'react-hook-form';
import { PLACEMENT } from './position';
export interface DevtoolUIProps {
    control: Control<any>;
    placement?: PLACEMENT;
    /** Custom styles for the "show/hide panel" button and for the panel div */
    styles?: {
        /** Custom styles for the "show/hide panel" button */
        button?: React.HTMLAttributes<HTMLButtonElement>['style'];
        /** Custom styles for the panel div */
        panel?: React.HTMLAttributes<HTMLDivElement>['style'];
    };
}
export declare const DevToolUI: React.FC<DevtoolUIProps>;
