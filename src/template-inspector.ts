import { html, css, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {styleMap} from 'lit/directives/style-map.js';
import {createRef, Ref, ref} from 'lit/directives/ref.js';
import { throttle } from 'mabiki'
import { findTarget, isCombo } from './utils';

@customElement('template-inspector')
export class TemplateInspector extends LitElement {
  static styles = css`
    .overlay {
      z-index: 100000;
      position: fixed;
      border: 2px dashed #666;
      background-color: rgba(0,0,0,0.8);
      color: #fff;
      border-radius: 5px;
      font-size: 14px;
      pointer-events: none;
      display: grid;
      place-items: center;
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
      <span class="overlay" ?hidden=${!this._overlayVisible} style=${styleMap(this._overlayStyle())} ${ref(this.overlayRef)}>${this._path}</span>
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
    'template-inspector': TemplateInspector
  }
}
