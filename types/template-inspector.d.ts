import { LitElement } from 'lit';
import { Ref } from 'lit/directives/ref.js';
export declare class MyElement extends LitElement {
    static styles: import("lit").CSSResult;
    urlPrefix: string;
    toggleComboKey: string;
    private _path?;
    private _overlayVisible;
    private _enabled;
    private _targetElement?;
    overlayRef: Ref<HTMLInputElement>;
    render(): import("lit-html").TemplateResult<1>;
    connectedCallback(): void;
    disconnectedCallback(): void;
    enable(): void;
    disable(): void;
    toggle(): void;
    private _addEventListener;
    private _removeEventListener;
    private _overlayStyle;
    private _handleMove;
    private _handleClick;
    private _handleKeyDown;
}
declare global {
    interface HTMLElementTagNameMap {
        'template-inspector': MyElement;
    }
}
