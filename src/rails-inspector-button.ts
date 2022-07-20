import { html, css, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('rails-inspector-button')
export class RailsInspectorButton extends LitElement {
  static styles = css`
    @unocss-placeholder
    [hidden] {
      display: none !important;
    }
  `
  render() {
    return html`
      <div
        title="Rails Inspector enabled"
        class="p-4 m-6 fixed z-[100000] bottom-0 right-0 shadow-lg bg-white rounded-full text-2xl cursor-pointer border border-transparent hover:bg-gray-50"
      >
        <div class="text-gray-700 text-3xl i-fluent-developer-board-search-24-regular"></div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rails-inspector-button': RailsInspectorButton
  }
}
