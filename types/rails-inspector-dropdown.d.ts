import { LitElement } from 'lit';

export declare class RailsInspectorDropdown extends LitElement {
  parentPaths: readonly string[];
  currentPath: string;
  private dropdownOpen;
  render(): import("lit").TemplateResult<1>;
  private _toggleDropdown;
  private _handleBlur;
  private _handleDropdownItemClick;
  private _dispatchOpen;
}

declare global {
  interface HTMLElementTagNameMap {
    'rails-inspector-dropdown': RailsInspectorDropdown;
  }
}
