import { LitElement } from 'lit';
export declare class RailsInspectorBreadcrumb extends LitElement {
    static styles: import("lit").CSSResult;
    parentPaths: readonly string[];
    currentPath: string;
    render(): import("lit").TemplateResult<1>;
    private _dispatchOpen;
}
declare global {
    interface HTMLElementTagNameMap {
        'rails-inspector-breadcrumb': RailsInspectorBreadcrumb;
    }
}
