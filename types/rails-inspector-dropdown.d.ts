import { LitElement, PropertyValues } from 'lit';
export declare class RailsInspectorDropdown extends LitElement {
    static styles: import("lit").CSSResult;
    parentPaths: readonly string[];
    currentPath: string;
    overlayVisible: boolean;
    private dropdownOpen;
    protected willUpdate(changedProperties: PropertyValues): void;
    render(): import("lit").TemplateResult<1>;
    private _toggleDropdown;
    private _handleDropdownItemClick;
    private _dispatchOpen;
}
declare global {
    interface HTMLElementTagNameMap {
        'rails-inspector-dropdown': RailsInspectorDropdown;
    }
}
