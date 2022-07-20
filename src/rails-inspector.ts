import { html, css, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {styleMap} from 'lit/directives/style-map.js'
import {createRef, Ref, ref} from 'lit/directives/ref.js'
import { throttle } from 'mabiki'
import {computePosition, flip, offset} from '@floating-ui/dom'
import { findTarget, isCombo } from './utils'

@customElement('rails-inspector')
export class RailsInspector extends LitElement {
  static styles = css`
    @unocss-placeholder
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

  @property({type: Boolean, attribute: 'auto-disable'})
  autoDisable: boolean = false

  @state()
  private _path?: string;

  @state()
  private _overlayVisible: boolean = false

  @state()
  private _enabled: boolean = false

  @state()
  private _targetElement?: HTMLElement

  @state()
  private _tooltipPosition: { left: string, top: string} = { left: '0', top: '0' }

  private throttledHandleMove: (event: MouseEvent) => void

  overlayRef: Ref<HTMLDivElement> = createRef();
  tooltipRef: Ref<HTMLSpanElement> = createRef();

  constructor() {
    super();
    this.throttledHandleMove = throttle(this._handleMove, 100)
  }

  render() {
    // NOTE: NOTE: The reason for `pointer-events-none` is that it needs to exclude itself from the `mousemove` event.
    return html`
      <div class="overlay absolute z-[100000] bg-blue-300 bg-opacity-50 pointer-events-none" ?hidden=${!this._overlayVisible} style=${styleMap(this._overlayStyle())} ${ref(this.overlayRef)}>
        <span class="
          shadow-md
          bg-gray-50
          text-fuchsia-800
          rounded-l
          text-xs
          absolute
          p-2
          font-bold
          font-sans
        " style=${styleMap(this._tooltipPosition)} ${ref(this.tooltipRef)}>
          ${this._path}</span>
      </div>
      <div
        ?hidden=${!this._enabled}
        @click=${this.disable}
        title="Rails Inspector enabled"
        class="p-4 m-6 fixed z-[100000] bottom-0 right-0 shadow-lg bg-white rounded-full text-2xl cursor-pointer border border-transparent hover:bg-gray-50"
      >
        <div class="text-gray-700 text-3xl i-fluent-developer-board-search-24-regular"></div>
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
    console.info('Rails Inspector enabled!')
  }

  disable() {
    this._enabled = false
    this._overlayVisible = false
    this._removeEventListener()
    console.info('Rails Inspector disabled!')
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

  private async updateTooltipPosition() {
    if (!(this.overlayRef.value && this.tooltipRef.value)) return

    const {x, y} = await computePosition(this.overlayRef.value, this.tooltipRef.value, {
      placement: 'top-start',
      middleware: [flip(), offset(5)]
    })
    this._tooltipPosition = {
      left: `${x}px`,
      top: `${y}px`,
    }
  }

  private _overlayStyle() {
    if (!this._targetElement) return {}

    const rect = this._targetElement.getBoundingClientRect()
    return {
      left: `${rect.left}px`,
      top: `${rect.top + (window.pageYOffset - document.documentElement.clientTop)}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    }
  }

  private _handleMove = (event: MouseEvent) => {
    const element = event.target

    if (!(element instanceof HTMLElement) || this.contains(element)) {
      this._overlayVisible = false
      return
    }

    const result = findTarget(element)
    this._path = result?.path
    if (result) {
      this._targetElement = result.element
      this._overlayVisible = true
      this.updateTooltipPosition()
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
      if (this.autoDisable) this.disable()
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
