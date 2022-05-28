import { html, css, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {styleMap} from 'lit/directives/style-map.js';
import {createRef, Ref, ref} from 'lit/directives/ref.js';
import { throttle } from 'mabiki'
import { findTarget, isCombo } from './utils';

@customElement('rails-inspector')
export class RailsInspector extends LitElement {
  static styles = css`
    .overlay {
      z-index: 100000;
      position: fixed;
      background-color: rgba(147,197,253, 0.5);
      pointer-events: none;
    }
    .path {
      background-color: #fff;
      border-radius: 2px;
      color: #86198f;
      font-family: Inter, -apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
      font-size: 12px;
      font-weight: 700;
      padding: 6px;
      position: absolute;
      top: 4px;
      left: 4px;
    }
    .shadow-md {
      --tw-shadow: 0 4px 6px -1px rgb(0 0 0/0.1),0 2px 4px -2px rgb(0 0 0/0.1);
      --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color),0 2px 4px -2px var(--tw-shadow-color);
      -webkit-box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);
      box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);
    }
    [hidden] {
      display: none !important;
    }
  `

  @property({attribute: 'url-prefix'})
  urlPrefix: string = 'vscode://file'

  @property()
  root: string = '/'

  @property({attribute: 'combo-key'})
  comboKey: string = 'meta-shift-v'

  @state()
  private _path?: string;

  @state()
  private _overlayVisible: boolean = false

  @state()
  private _enabled: boolean = false

  @state()
  private _targetElement?: HTMLElement

  private throttledHandleMove: (event: MouseEvent) => void

  overlayRef: Ref<HTMLInputElement> = createRef();

  constructor() {
    super();
    this.throttledHandleMove = throttle(this._handleMove, 100)
  }

  render() {
    return html`
      <div class="overlay" ?hidden=${!this._overlayVisible} style=${styleMap(this._overlayStyle())} ${ref(this.overlayRef)}>
        <span class="path shadow-md">${this._path}</span>
      </div>
    `
  }

  connectedCallback() {
    super.connectedCallback();
    document.body.addEventListener('keydown', this._handleKeyDown);
    console.info(`Ready to Template Inspector. Press ${this.comboKey} to toggle.`)
  }

  disconnectedCallback() {
    document.body.removeEventListener('keydown', this._handleKeyDown);
    this._removeEventListener()
    super.disconnectedCallback();
  }

  enable() {
    this._enabled = true
    this._addEventListener()
    console.info('Template Inspector enabled!')
  }

  disable() {
    this._enabled = false
    this._overlayVisible = false
    this._removeEventListener()
    console.info('Template Inspector disabled!')
  }

  toggle() {
    this._enabled ? this.disable() : this.enable()
  }

  private _addEventListener() {
    document.body.addEventListener('mousemove', this.throttledHandleMove);
    document.body.addEventListener('click', this._handleClick);
  }

  private _removeEventListener() {
    document.body.removeEventListener('mousemove', this.throttledHandleMove);
    document.body.removeEventListener('click', this._handleClick);
  }

  private _overlayStyle() {
    if (!this._targetElement) return {}

    const rect = this._targetElement.getBoundingClientRect()

    return {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    }
  }

  private _handleMove = (event: MouseEvent) => {
    const element = event.target as HTMLElement
    const result = findTarget(element)
    this._path = result?.path
    if (result) {
      this._targetElement = result.element
      this._overlayVisible = true
    } else {
      this._overlayVisible = false
    }
  }

  private _handleClick = (event: MouseEvent) => {
    const element = event.target as HTMLElement
    const result = findTarget(element)
    if (result) {
      event.preventDefault()
      window.open(`${this.urlPrefix}${this.root}/${result.path}`)
    }
  }

  private _handleKeyDown = (event: KeyboardEvent) => {
    if (['Escape', 'Esc'].includes(event.key)) {
      if (this._enabled) this.disable()
      return
    }

    if (isCombo(this.comboKey, event)) {
      this.toggle()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rails-inspector': RailsInspector
  }
}
