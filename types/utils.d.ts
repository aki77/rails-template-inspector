declare type FindTargetResult = {
    element: HTMLElement;
    path: string;
};
export declare const findTarget: (element: HTMLElement) => FindTargetResult | undefined;
export declare const isCombo: (comboKey: string, event: KeyboardEvent) => boolean;
export {};
