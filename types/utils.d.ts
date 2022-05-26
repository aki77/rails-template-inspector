declare type FindTargetResult = {
    element: HTMLElement;
    path: string;
};
export declare const findTarget: (element: HTMLElement) => FindTargetResult | undefined;
export declare const isKeyActive: (key: string, event: KeyboardEvent) => boolean;
export {};
