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
        <div class="text-gray-700 h-[32px]">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--fluent" width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M16.993 1.648A.75.75 0 0 0 16.25 1l-.102.007l-.097.02a.75.75 0 0 0-.551.723v2.249h-1.751l.001-2.249l-.007-.102A.75.75 0 0 0 13 1l-.102.007a.75.75 0 0 0-.648.743l-.001 2.249H10.5V1.75l-.007-.102A.75.75 0 0 0 9 1.75v2.325a3.754 3.754 0 0 0-2.925 2.924L3.75 7l-.102.007A.75.75 0 0 0 3 7.75l.007.102a.75.75 0 0 0 .743.648L6 8.499v1.75l-2.25.001l-.102.007A.75.75 0 0 0 3 11l.007.102a.74.74 0 0 0 .188.403A5.48 5.48 0 0 1 5.5 11c.706 0 1.38.133 2 .375V7.75A2.25 2.25 0 0 1 9.75 5.5h6.5a2.25 2.25 0 0 1 2.25 2.25v6.5a2.25 2.25 0 0 1-2.25 2.25H11c0 .52-.072 1.023-.207 1.499h1.456l.001 2.251l.007.102A.75.75 0 0 0 13 21l.102-.007a.75.75 0 0 0 .648-.743l-.001-2.251H15.5v2.251l.007.102A.75.75 0 0 0 17 20.25v-2.325A3.754 3.754 0 0 0 19.925 15h2.325l.102-.007A.75.75 0 0 0 23 14.25l-.007-.102a.75.75 0 0 0-.743-.648H20v-1.75h2.25l.102-.007A.75.75 0 0 0 23 11l-.007-.102a.75.75 0 0 0-.743-.648H20V8.5h2.25l.102-.007A.75.75 0 0 0 22.25 7h-2.325A3.754 3.754 0 0 0 17 4.075V1.75l-.007-.102Zm-.988 9.357a3 3 0 1 0-6 0a3 3 0 0 0 6 0Zm-4.5 0a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0ZM5.5 21a4.48 4.48 0 0 0 2.607-.832l2.613 2.612a.75.75 0 1 0 1.06-1.06l-2.612-2.613A4.5 4.5 0 1 0 5.5 21Zm0-1.5a3 3 0 1 1 0-6a3 3 0 0 1 0 6Z"></path></svg>
        </div>
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
