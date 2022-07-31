import './rails-inspector-button'
import './rails-inspector-breadcrumb'
import { html, css, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {styleMap} from 'lit/directives/style-map.js'
import {createRef, Ref, ref} from 'lit/directives/ref.js'
import { throttle } from 'mabiki'
import {computePosition, flip, offset} from '@floating-ui/dom'
import { findParentTargets, findTarget, FindTargetResult, isCombo } from './utils'

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

  @property({type: Boolean, attribute: 'not-auto-disable'})
  notAutoDisable: boolean = false

  @state()
  private _result?: FindTargetResult;

  @state()
  private _parentPaths: readonly string[] = []

  @state()
  private _overlayVisible: boolean = false

  @state()
  private _enabled: boolean = false

  @state()
  private _tooltipPosition: { left: string, top: string} = { left: '0', top: '0' }

  private throttledHandleMove: (event: MouseEvent) => void

  overlayRef: Ref<HTMLDivElement> = createRef();
  tooltipRef: Ref<HTMLDivElement> = createRef();

  constructor() {
    super();
    this.throttledHandleMove = throttle(this._handleMove, 100)
  }

  render() {
    // NOTE: NOTE: The reason for `pointer-events-none` is that it needs to exclude itself from the `mousemove` event.
    return html`
      <div class="overlay absolute z-[100000] bg-blue-300 bg-opacity-50 pointer-events-none" ?hidden=${!this._overlayVisible} style=${styleMap(this._overlayStyle())} ${ref(this.overlayRef)}>
        <div class="
          shadow-md
          bg-gray-50
          text-fuchsia-800
          rounded-l
          text-xs
          absolute
          py-1
          px-2
          flex
          items-center
          gap-3
          font-bold
          font-sans
          pointer-events-auto
        " style=${styleMap(this._tooltipPosition)} @mousemove=${this._stopPropagation} ${ref(this.tooltipRef)}>
          <span>${this._result?.path}</span>
          <rails-inspector-breadcrumb
            .parentPaths=${this._parentPaths}
            currentPath=${this._result?.path}
            ?hidden=${this._parentPaths.length === 0}
            @open=${this._handleOpen}>
          </rails-inspector-breadcrumb>
        </div>
      </div>
      <rails-inspector-button
        ?hidden=${!this._enabled}
        @click=${this.disable}
        @mousemove=${this._handleMouseMoveButton}
      >
      </rails-inspector-button>
    `
  }

  connectedCallback() {
    super.connectedCallback();
    document.body.addEventListener('keydown', this._handleKeyDown);
    console.info(`Ready to Template Inspector. Press ${this.comboKey} to toggle.`)

    if (this.autoDisable) {
      console.warn('Deprecated `auto-disable` is enabled. Please use `not-auto-disable` instead.')
    }
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
      middleware: [flip(), offset(-24)]
    })
    this._tooltipPosition = {
      left: `${x}px`,
      top: `${y}px`,
    }
  }

  private _overlayStyle() {
    if (!this._result) return {}

    const rect = this._result.element.getBoundingClientRect()
    return {
      left: `${rect.left}px`,
      top: `${rect.top + (window.pageYOffset - document.documentElement.clientTop)}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    }
  }

  private _handleMove = (event: MouseEvent) => {
    const element = event.target
    if (!(element instanceof HTMLElement)) return

    const result = findTarget(element)
    this._result = result
    if (result) {
      this._parentPaths = findParentTargets(result.element, result.path).map(({path}) => path)
      this._overlayVisible = true
      this.updateTooltipPosition()
    } else {
      this._overlayVisible = false
    }
  }

  private _handleMouseMoveButton = (event: MouseEvent) => {
    this._overlayVisible = false
    event.stopPropagation()
  }

  private _handleClick = (event: MouseEvent) => {
    const element = event.target as HTMLElement
    const result = findTarget(element)
    if (result) {
      event.preventDefault()
      window.open(`${this.urlPrefix}${this.root}/${result.path}`)
      if (!this.notAutoDisable) this.disable()
    }
  }

  private _handleOpen = (event: CustomEvent) => {
    window.open(`${this.urlPrefix}${this.root}/${event.detail.path}`)
    if (!this.notAutoDisable) this.disable()
  }

  private _stopPropagation = (event: Event) => {
    event.stopPropagation()
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
