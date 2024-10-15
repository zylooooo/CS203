import { Story, Meta } from '@storybook/react';
import { PLACEMENT } from '../position';
declare type Props = {
    placement?: PLACEMENT;
};
declare const _default: Meta<import("@storybook/react").Args>;
export default _default;
export declare const DefaultDevTool: Story<Props>;
export declare const TopLeftDevTool: Story<Props>;
export declare const BottomRightDevTool: Story<Props>;
export declare const BottomLeftDevTool: Story<Props>;
