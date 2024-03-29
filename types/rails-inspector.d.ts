import './rails-inspector-button';
import './rails-inspector-breadcrumb';
import { LitElement } from 'lit';
import { Ref } from 'lit/directives/ref.js';
export declare class RailsInspector extends LitElement {
    static styles: import("lit").CSSResult;
    urlPrefix: string;
    root: string;
    comboKey: string;
    autoDisable: boolean;
    noAutoDisable: boolean;
    private _result?;
    private _parentPaths;
    private _overlayVisible;
    private _enabled;
    private _tooltipPosition;
    private throttledHandleMove;
    overlayRef: Ref<HTMLDivElement>;
    tooltipRef: Ref<HTMLDivElement>;
    constructor();
    render(): import("lit-html").TemplateResult<1>;
    connectedCallback(): void;
    disconnectedCallback(): void;
    enable(): void;
    disable(): void;
    toggle(): void;
    private _addEventListener;
    private _removeEventListener;
    private updateTooltipPosition;
    private _overlayStyle;
    private _handleMove;
    private _handleMouseMoveButton;
    private _handleClick;
    private _handleOpen;
    private _open;
    private _stopPropagation;
    private _handleKeyDown;
}
declare global {
    interface HTMLElementTagNameMap {
        'rails-inspector': RailsInspector;
    }
}
