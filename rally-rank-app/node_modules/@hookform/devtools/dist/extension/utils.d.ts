export declare function proxyToObject<T extends Record<string, any>>(proxy: T): T;
export declare function nestToFlat<V>(flatKeys: string[], obj: object, defaultValue?: V): Record<string, V>;
