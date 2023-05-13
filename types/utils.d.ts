type FindTargetOptions = {
    ignorePaths?: string[];
};
export type FindTargetResult = {
    element: HTMLElement;
    path: string;
};
export declare const findTarget: (element: HTMLElement, options?: FindTargetOptions) => FindTargetResult | undefined;
export declare const findParentTargets: (element: HTMLElement, path: string) => readonly FindTargetResult[];
export declare const isCombo: (comboKey: string, event: KeyboardEvent) => boolean;
export {};
