export declare type PLACEMENT = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export declare function getPositionByPlacement(placement: PLACEMENT, defaultX?: number, defaultY?: number): {
    [x: string]: number;
};
