import {LitElement, html, customElement, property, query} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';

import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

import '@polymer/iron-input/iron-input.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-styles/paper-styles.js';
import './exmg-paper-combobox-icons.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';

import {EventSelectPayload, GenericPropertyValues, isEventWithPath, Token} from './exmg-custom-types';
import {PaperMenuButton} from '@polymer/paper-menu-button/paper-menu-button';
import  {PaperListboxElement} from '@polymer/paper-listbox/paper-listbox';

type PrivateProps = 'inputValue' | 'selectedValue';
type Props = Exclude<keyof PaperComboboxElement, number | Symbol> | PrivateProps;

type ChangedProps = GenericPropertyValues<Props>;

const copyElementStyle = (source: HTMLElement, target: HTMLElement): void  => {
  const computedStyle = window.getComputedStyle(source, null);
  Array.from(computedStyle)
      .forEach(key => target.style.setProperty(
          key,
          computedStyle.getPropertyValue(key),
          computedStyle.getPropertyPriority(key)
      ));
};

/**
* @namespace Exmg
*/
(window as any).Exmg = (window as any).Exmg || {};

const BACKSPACE = 8;
const ARROW_DOWN = 40;
const DELETE = 127;
const ESC = 27;

const debounce  = (time: number) => {
  let timer: number;

  return (cb?: Function): void => {
    clearTimeout(timer);
    if (cb) {
      timer = window.setTimeout(cb, time);
    }
  };
};

/**
* `exmg-paper-combobox` is an wrapper element to make list data selectable.
* The Element comes with options to make the list required, disabled and/or auto-validate.
* Lists should consist of id's and names and can have images.
* ```
* <exmg-paper-combobox label="Creatives" selected="1" required>
*   <paper-item>Rubin</paper-item>
*   <paper-item>Gennie</paper-item>
*   <paper-item>Ronna</paper-item>
*   <paper-item>Jacquie</paper-item>
*   <paper-item>Norene</paper-item>
*   <paper-item>Beatris</paper-item>
*   <paper-item>Ginny</paper-item>
*   <paper-item>Tiesha</paper-item>
*   <paper-item>Leonore</paper-item>
*   <paper-item>Evonne</paper-item>
* </exmg-paper-combobox>
* ```
*
* @customElement
* @polymer
* @group Exmg Elements
* @element exmg-paper-combobox
* @demo demo/index.html
* @memberof Exmg
* @extends LitElement
* @summary Paper Combobox Element
* @eventType exmg-combobox-select - detail is type EventSelectPayload
* @eventType exmg-combobox-deselect - detail undefined
*/
@customElement('exmg-paper-combobox')
export class PaperComboboxElement extends LitElement {
  /**
   * If you want to use an attribute value or property of an element for
   * `selected` instead of the index, set this to the name of the attribute
   * or property. Hyphenated values are converted to camel case when used to
   * look up the property of a selectable element. Camel cased values are
   * *not* converted to hyphenated values for attribute lookup. It's
   * recommended that you provide the hyphenated form of the name so that
   * selection works in both cases. (Use `attr-or-property-name` instead of
   * `attrOrPropertyName`.)
   */
  @property({type: String, attribute: 'attr-for-selected'}) attrForSelected: string = '';

  /**
   * By default the textContent of the paper-item/paper-icon-item or paper-item-body
   * will be used for display in badge after selection. In case of icon and body
   * you probably want an alternative. The selector can be used to be a bit more
   * specific on which element can be used for display purposes.
   */
  @property({type: String, attribute: 'selected-item-selector'}) selectedItemSelector?: string;

  /**
   * Returns currently selected item.
   * @type {?Object}
   */
  @property({type: Object, attribute: 'selected-item'}) selectedItem?: Element;

  /**
   * Gets or sets the selected element. The default is to use the index of the item.
   * @type {string|number}
   */
  @property({type: String}) selected?: string | number;

  /**
   * Set custom max width of menu list with items
   * @type {number = 200}
   */
  @property({type: Number, attribute: 'max-width-menu-list'}) maxWidthMenuList: number = 200;

  @property({type: String}) private selectedValue?: string | number;

  /**
   * The label for this input.
   */
  @property({type: String}) label?: string;

  /**
   * Set to true to auto-validate the input value.
   */
  @property({type: Boolean, attribute: 'auto-validate'}) autoValidate: boolean = false;

  @property({type: Boolean}) autofocus: boolean = false;

  /**
   * Set to true to disable this input.
   */
  @property({type: Boolean}) disabled: boolean = false;

  /**
   * The error message to display when the input is invalid.
   */
  @property({type: String, attribute: 'error-message'}) errorMessage?: string = '';

  @property({type: Boolean, attribute: 'always-float-label'}) alwaysFloatLabel: boolean = false;

  /**
   * Set to true to mark the input as required. If you're using PaperInputBehavior to
   * implement your own paper-input-like element, bind this to
   * the `<input is="iron-input">`'s `required` property.
   */
  @property({type: Boolean}) required: boolean = false;

  @property({type: String}) name?: string;

  /**
   * This field will be bind to the actual input field.
   */
  @property({type: String, attribute: 'input-value'}) private inputValue: string = '';

  @property({type: Object}) private token?: Token;

  /**
   * Invalid is true if validation fails and is passed on.
   */
  @property({type: Boolean}) invalid: boolean = false;

  /**
   * Focus input field if value has been set on element.
   */
  @property({type: Boolean, attribute: 'input-focused'}) inputFocused: boolean = false;

  @property({type: Boolean, attribute: 'no-float-label'}) noFloatLabel: boolean = false;

  /**
   * Is menu button state open
   */
  @property({type: Boolean}) private opened: boolean = false;

  @query('#listbox')
  private listBox?: PaperListboxElement;

  @query('#inputValue')
  private inputElement?: HTMLInputElement;

  @query('#inputWidthHelper')
  private inputWidthHelperElement?: HTMLElement;

  @query('#menu')
  private menuElement?: PaperMenuButton;

  private previousInsideClick: boolean = false;

  private ignoreFocus: boolean = false;

  private isAnyItemActive: boolean = true;

  private isElementInitialized: boolean = false;

  private readonly observers: {[K in Props]?: Function} = this.getObservers();

  private readonly keyDownBackspaceDebounce: (cb?: Function) => void = debounce(200);

  private readonly inputChangeDebounce: (cb?: Function) => void  = debounce(300);

  constructor() {
    super();
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onIronResize = this.onIronResize.bind(this);
  }

  get value() {
    return this.selected;
  }

  set value(value) {
    this.selected = value;
  }

  /***************** OBSERVERS *******************/

  /**
   * Register observed properties and actions to perform
   */
  private getObservers(): {[K in Props]?: Function} {
    return {
      inputValue: () => this.observeInputChange(),
      selectedItem: () => this.observeSelectedItem(),
      selectedValue: () => this.observeSelectedValue(),
      selected: () => this.observeSelected(),
    };
  }

  private executeObservers(changedProperties: ChangedProps): void {
    Object.entries(this.observers).forEach(([key, cb]) => {
      if (cb && changedProperties.has(<Props>key)) {
        cb(changedProperties);
      }
    });
  }

  private observeInputChange() {
    if (this.inputElement && this.inputWidthHelperElement) {
      this.inputElement.style.width = `${(this.inputWidthHelperElement.offsetWidth + 10)}px`;
    }

    if (!this.isElementInitialized) {
      this.isAnyItemActive = this.filterItems();
    }

    if (this.isElementInitialized && this.menuElement) {
      this.inputChangeDebounce(() => {
        this.isAnyItemActive = this.filterItems();
        this.onIronResize();

        if (!this.menuElement!.opened && this.isAnyItemActive && !!this.inputValue) {
          this.menuElement!.open();
          afterNextRender(this, () => this.focus());
        } else if (this.menuElement!.opened && !this.isAnyItemActive) {
          this.menuElement!.close();
        }

      });
    }
  }

  private observeSelectedValue(): void {
    this.selected = this.selectedValue;
  }

  private observeSelected(): void {
    if (this.selectedValue !== this.selected) {
      this.ignoreFocus = true;
    }

    this.selectedValue = this.selected;
  }

  private observeSelectedItem(): void {
    if (!this.selectedItem) {
      this.token = undefined;
      return;
    }

    const id = this.getSelectedItemKey(this.selectedItem);
    if (typeof id === 'undefined') {
      this.selectedValue = undefined;
      this.selectedItem = undefined;
      this.token = undefined;
      return;
    }

    const content: Element | null = this.selectedItemSelector ?
        this.selectedItem.querySelector(this.selectedItemSelector) :
        this.selectedItem;

    const text = (content && content.textContent) || '';

    this.token = {id, text};
  }

  filterItems(): boolean {
    const items: NodeListOf<HTMLElement> = this.querySelectorAll('paper-item, paper-icon-item');
    const hasFilterPhrase = !!this.inputValue && this.inputValue.length > 0;
    const phrase = hasFilterPhrase ? this.inputValue.toLowerCase().trim() : '';
    let isAnyItemActive = false;

    items.forEach(item => {
      if (hasFilterPhrase && item.textContent &&  item.textContent.toLowerCase().indexOf(phrase) === -1) {
        item.setAttribute('hidden', '');
      } else {
        isAnyItemActive = true;
        item.removeAttribute('hidden');
      }
    });

    return isAnyItemActive;
  }

  indexOf(item: any): number {
    return this.listBox && this.listBox.items ? this.listBox.items.indexOf(item) : -1;
  }

  private getSelectedItemKey(selectedItem: Element): number | string | undefined {
    if (!!this.attrForSelected) {
      return  selectedItem.getAttribute(this.attrForSelected) || undefined;
    }

    const index = this.indexOf(selectedItem);

    return index === -1 ? undefined : index;
  }

  private hasSelectedItem(): boolean {
    return !!this.selectedItem;
  }

  /**
    * this method can be used to set the focus of the element
    */
  focus() {
    this.inputElement!.focus();
  }

  /**
    * This method will automatically set the label float.
    */
  private computeAlwaysFloatLabel(): boolean {
    if (this.alwaysFloatLabel) {
      return true;
    }

    return !!this.token || this.inputFocused;
  }

  private resetInput(): void {
    if (this.autoValidate) {
      this.validate();
    }

    this.inputValue = '';
    this.inputElement!.value = '';
    if (this.ignoreFocus) {
      this.ignoreFocus = false;
    } else {
      this.focus();
    }
  }

  /**
   * Returns true if `value` is valid.
   * @return {boolean} True if the value is valid.
   */
  validate(): boolean {
    this.invalid = !this.disabled && this.required && !this.hasSelectedItem();
    return !this.invalid;
  }

  /************ EVENT HANDLERS *************/
  private onKeyDown(e: KeyboardEvent): void {
    if (typeof this.inputValue !== 'string') {
      this.inputValue = '';
    }

    switch (e.code || e.keyCode) {
      case BACKSPACE:
      case 'Backspace':
      case DELETE:
      case 'Delete':
        if (!this.menuElement!.opened) {
          this.keyDownBackspaceDebounce(() => {
            if (!this.menuElement!.opened && this.isAnyItemActive) {
              this.menuElement!.open();
              afterNextRender(this, () => this.focus());
            }
          });
        }

        this.selectedValue = undefined;
        this.selectedItem = undefined;
        break;
      case ARROW_DOWN:
      case 'ArrowDown':
        if (!this.menuElement!.opened && this.isAnyItemActive) {
          this.menuElement!.open();
        }
        afterNextRender(this, () => this.listBox!.focus());
        break;
      case ESC:
      case 'Escape':
        e.preventDefault();
        this.menuElement!.close();
        afterNextRender(this, () => this.focus());
    }
  }

  private onClick(e: Event): void {
    const inside: boolean = isEventWithPath(e) ? !!e.path && !!e.composedPath().find((path) => path === this) : e.target === this;

    // Detect outside element click for auto validate input
    if (this.autoValidate && (this.previousInsideClick && !inside) || this.token) {
      this.validate();
    }

    this.previousInsideClick = inside;
  }

  private onContainerTap(e: Event): void {
    e.preventDefault();
    this.menuElement!.open();
    afterNextRender(this, () => this.focus());
  }

  private onItemSelected(e: CustomEvent<{item: Element}>): void {
    e.stopPropagation();
    this.selectedItem = e.detail.item;
    this.selected = this.getSelectedItemKey(this.selectedItem);

    this.resetInput();
  }

  private onItemDeselected(e: Event): void {
    e.stopPropagation();
    this.selectedItem = undefined;
    this.selected = undefined;

    this.resetInput();
  }

  private onItemActivated(e: CustomEvent<{selected: string | number}>): void {
    // when user select same item then don't receive iron-select event but we still want to
    // prepare input
    if (this.selected === e.detail.selected) {
      this.ignoreFocus = false;
      afterNextRender(this, () => this.resetInput());
    }
  }

  private onMenuButtonOpen(e: Event): void {
    e.preventDefault();
    this.opened = true;
  }

  private onMenuButtonClose(e: Event): void {
    e.preventDefault();
    this.opened = false;
  }

  private onInputValueChange(e: Event): void {
    this.inputValue = (<HTMLInputElement>e.target).value;
  }

  private onInputFocusChanged(event: CustomEvent): void {
    this.inputFocused = event.detail.value;
  }

  private onTokenClick() {
    this.focus();
  }

  private initializeElement() {
    /* Initialize the input helper span element for determining the actual width of the input
    * text. This width will be used to create a dynamic width on the input field
    */
    if (this.inputWidthHelperElement) {
      copyElementStyle(this.inputElement!, this.inputWidthHelperElement);
      this.inputWidthHelperElement.style.position = 'absolute';
      this.inputWidthHelperElement.style.top = '-999px';
      this.inputWidthHelperElement.style.left = '0';
      this.inputWidthHelperElement.style.padding = '0';
      this.inputWidthHelperElement.style.width = 'auto';
      this.inputWidthHelperElement.style.whiteSpace = 'pre';
    }

    this.inputElement!.addEventListener('keydown', this.onKeyDown);

    if (this.autoValidate) {
      window.addEventListener('click', this.onClick);
    }

    this.addEventListener('iron-resize', this.onIronResize);
  }

  /**
   * Fix menu content width and height
   */
  private onIronResize(): void {
    const element: HTMLElement = this.menuElement!.shadowRoot!.querySelector<HTMLElement>('.dropdown-content')!;

    const {left: elementLeft} = element.getBoundingClientRect();
    const {scrollWidth: elementScrollWidth} = element;
    const getGreater = (...values: number[]): number  => Math.max(...values);
    const getLower = (...values: number[]): number  => Math.min(...values);

    if (elementScrollWidth > 0 && elementScrollWidth < this.maxWidthMenuList) {
      const elementMaximumWidthFromRight = document.documentElement!.clientWidth - elementLeft;
      element.style.maxWidth = `${getLower(getGreater(elementMaximumWidthFromRight, 100), this.maxWidthMenuList)}px`;
    }

    const {top:  elementTop} = element.getBoundingClientRect();
    const {scrollHeight: elementScrollHeight} = element;
    if (elementScrollHeight > 0) {
      const elementMaximumHeightToBottom = document.documentElement!.clientHeight - elementTop;
      element.style.maxHeight = `${getGreater(elementMaximumHeightToBottom - 10, 100)}px`;
    }
  }

  private shouldFireEvent(changedProperties: GenericPropertyValues<keyof this | PrivateProps>): boolean {
    const props: (keyof this | PrivateProps)[] = ['selected', 'selectedItem'];
    const anyPropChanged = props.some((it: keyof this | PrivateProps) =>
      // @ts-ignore
      changedProperties.has(it) && changedProperties.get(it) !== this[it]
    );

    const {id = undefined} = this.token || {};

    return (anyPropChanged && id === this.selected);
  }

  /*****  LIT ELEMENT HOOKS ******/

  protected async firstUpdated(): Promise<void> {
    this.initializeElement();
    await this.updateComplete;
    this.isElementInitialized = true;
  }

  protected updated(changedProperties: ChangedProps) {
    this.executeObservers(changedProperties);
    if (this.shouldFireEvent(changedProperties)) {
      if (typeof this.selected !== 'undefined') {
        const payload: EventSelectPayload = {
          value: this.selected!,
          item: this.selectedItem!,
          token: this.token!,
        };

        this.dispatchEvent(new CustomEvent('exmg-combobox-select', {detail: payload, composed: true, bubbles: true}));
      } else {
        this.dispatchEvent(new CustomEvent('exmg-combobox-deselect', {composed: true, bubbles: true}));
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.inputElement && this.inputElement.removeEventListener('keydown', this.onKeyDown);
    this.removeEventListener('iron-resize', this.onIronResize);
    if (this.autoValidate) {
      window.removeEventListener('click', this.onClick);
    }
    this.inputChangeDebounce();
    this.keyDownBackspaceDebounce();
  }

  protected render() {
    return html`
      ${this.getTemplate()}
    `;
  }

  private getTemplate() {
    // noinspection CssUnresolvedCustomPropertySet
    return html`
      <style>
        :host {
          display: block;
          min-width: 167px;
        }
        :host([focused]) {
          outline: none;
        }
        :host([hidden]) {
          display: none !important;
        }
        input {
          /* Firefox sets a min-width on the input, which can cause layout issues */
          min-width: 0;
        }
        .container {
          @apply --layout-horizontal;
        }
        .container.with-label > paper-menu-button {
          margin-top: 16px;
        }
        paper-input-container {
          @apply --layout-flex;
        }
        .tokens {
          margin-right: 6px;
          min-height: 24px;
          position: relative;
          width: 100%;
        }
        .tokens paper-button {
          margin: 0;
          padding: 0 4px;
          height: 22px;
          font-size: 16px;
          min-width: initial;
          max-width: 100%
        }
        .tokens paper-button span {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .tokens paper-button iron-icon {
          height: 16px;
          width: 16px;
        }
        .tokens.selected input {
          color: transparent;
          width: 1px !important;
        }
        #inputValue {
          font: inherit;
          outline: none;
          box-shadow: none;
          background: transparent;
          border: none;
          width: auto;
          max-width: 100%;
        }
        paper-menu-button {
          padding: 0;
        }
        paper-icon-button {
          margin: 0;
        }
        paper-button {
          padding: 0;
        }
        .container {
          @apply --layout-flex;
        }
        iron-input {
          line-height: 22px;
        }
      </style>
      <div class="container ${this.label && !this.noFloatLabel ? 'with-label' : ''}">
        <paper-input-container
          ?no-label-float="${this.noFloatLabel || !this.label}"
          ?always-float-label="${this.computeAlwaysFloatLabel()}"
          @tap="${this.onContainerTap}"
          ?disabled="${this.disabled}"
          ?focused="${this.inputFocused}"
          @focused-changed="${this.onInputFocusChanged}"
          ?invalid="${this.invalid}"
          id="paperInputContainer"
        >
          ${ !this.selected || !this.noFloatLabel ? html`<label slot="label" ?hidden="${!this.label}" aria-hidden="true">${this.label}</label>` : '' }
          <iron-input bind-value="${this.inputValue}" slot="input">
            <span class="${classMap({tokens: true, selected: !!this.token})}">
              ${this.renderTokenButton()}
              <input
                id="inputValue"
                aria-labelledby="label"
                value="${this.inputValue}"
                @input="${this.onInputValueChange}"
                ?autofocus="${this.autofocus}"
                autocomplete="off"
                ?disabled="${this.disabled}">
            </span>
          </iron-input>
          <paper-input-error slot="add-on" aria-live="assertive">${this.errorMessage}</paper-input-error>
        </paper-input-container>

        <span id="inputWidthHelper">${this.inputValue} </span>

        <paper-menu-button id="menu" ?opened="${this.opened}" ?disabled="${this.disabled}"
          @paper-dropdown-open="${this.onMenuButtonOpen}"
          @paper-dropdown-close="${this.onMenuButtonClose}"
          close-on-activate vertical-offset="40" horizontal-align="right">
          <paper-icon-button icon="exmg-paper-combobox-icons:arrow-drop-down" ?data-opened="${this.opened}" slot="dropdown-trigger">
          </paper-icon-button>
          <paper-listbox
            id="listbox"
            slot="dropdown-content"
            selectable="paper-item:not([hidden]),paper-icon-item:not([hidden])"
            attr-for-selected="${this.attrForSelected}"
            selected="${this.selectedValue}"
            class="dropdown-content"
            @iron-activate="${this.onItemActivated}"
            @iron-select="${this.onItemSelected}"
            @iron-deselect="${this.onItemDeselected}">
            <slot></slot>
          </paper-listbox>
        </paper-dropdown-menu>
      </div>
    `;
  }

  private renderTokenButton() {
    if (!this.token) {
      return null;
    }

    return html`<paper-button tabindex="-1" @click="${this.onTokenClick}"><span>${this.token!.text}</span></paper-button>`;
  }
}

(window as any).Exmg.PaperComboboxElement = PaperComboboxElement;
