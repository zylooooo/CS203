import { Control } from 'react-hook-form';
export declare function useExportControlToExtension({ id, control, }: {
    id: string;
    control: Control<any>;
}): {
    isExtensionEnabled: boolean;
};
