import { html, css, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

const basename = (path: string): string => {
  const parts = path.split('/')
  return parts[parts.length - 1]
}

@customElement('rails-inspector-dropdown')
export class RailsInspectorDropdown extends LitElement {
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

  @state()
  private dropdownOpen: boolean = false

  render() {
    const dropdownItems = [
      this.currentPath,
      ...this.parentPaths.slice().reverse()
    ]

    return html`
      <div class="relative inline-block">
        <button
          type="button"
          class="bg-none border-none outline-none cursor-pointer text-gray-500 hover:text-gray-700 p-1"
          @click=${this._toggleDropdown}
        >
          <div class="i-bi-chevron-down"></div>
        </button>
        <div class="absolute right-0 bg-white min-w-200px shadow-lg z-1 border border-gray-300 rounded max-h-300px overflow-y-auto" ?hidden=${!this.dropdownOpen}>
          ${dropdownItems.map((path, index) => html`
            <div
              class="text-black px-3 py-2 no-underline block cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-gray-100 ${index === 0 ? 'font-bold bg-gray-50' : ''}"
              title=${path}
              @click=${(event: Event) => this._handleDropdownItemClick(event, path)}
            >
              ${basename(path)}
            </div>
          `)}
        </div>
      </div>
    `
  }

  private _toggleDropdown(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.dropdownOpen = !this.dropdownOpen
  }

  private _handleDropdownItemClick(event: Event, path: string) {
    event.preventDefault()
    event.stopPropagation()
    this.dropdownOpen = false
    this._dispatchOpen(event, path)
  }

  private _dispatchOpen(_event: Event, path: string) {
    const options = {
      detail: { path },
      bubbles: true,
      composed: true
    };
    this.dispatchEvent(new CustomEvent('open', options));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rails-inspector-dropdown': RailsInspectorDropdown
  }
}
