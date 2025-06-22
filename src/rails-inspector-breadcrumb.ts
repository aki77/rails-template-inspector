import { html, css, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './rails-inspector-dropdown.js'

const basename = (path: string): string => {
  const parts = path.split('/')
  return parts[parts.length - 1]
}

@customElement('rails-inspector-breadcrumb')
export class RailsInspectorBreadcrumb extends LitElement {
  static styles = css`
    @unocss-placeholder
    [hidden] {
      display: none !important;
    }
  `

  @property({ attribute: false })
  parentPaths: readonly string[] = []

  @property()
  currentPath: string = ''

  render() {
    return html`
    <div class="flex items-center gap-1 text-gray-500 font-normal">
      ${this.parentPaths.map((path) => html`
        <span class="cursor-pointer" title=${path} @click=${(event: Event) => this._dispatchOpen(event, path)}>${basename(path)}</span>
        <div class="i-bi-chevron-right"></div>
      `)}
      <span class="cursor-pointer" title=${this.currentPath} @click=${(event: Event) => this._dispatchOpen(event, this.currentPath)}>${basename(this.currentPath)}</span>

      <rails-inspector-dropdown
        class="ml-2"
        .parentPaths=${this.parentPaths}
        .currentPath=${this.currentPath}
        @open=${this._handleDropdownOpen}
      ></rails-inspector-dropdown>
    </div>
    `
  }  private _dispatchOpen(event: Event, path: string) {
    event.preventDefault()
    event.stopPropagation()

    const options = {
      detail: {path},
      bubbles: true,
      composed: true
    };
    this.dispatchEvent(new CustomEvent('open', options));
  }

  private _handleDropdownOpen(event: CustomEvent) {
    // ドロップダウンからのopenイベントをそのまま上位に転送
    const options = {
      detail: event.detail,
      bubbles: true,
      composed: true
    };
    this.dispatchEvent(new CustomEvent('open', options));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rails-inspector-breadcrumb': RailsInspectorBreadcrumb
  }
}
