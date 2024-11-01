import { GlobalState } from '../types';
declare const _default: {
    updateStore(defaultValues: GlobalState): void;
    saveStore(): void;
    state: GlobalState;
    options: Partial<{
        name: string;
        middleWares: import("../types").MiddleWare[];
        storageType: Storage;
        persist: "none" | "action" | "beforeUnload";
    }>;
};
export default _default;
