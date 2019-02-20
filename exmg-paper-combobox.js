var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, customElement, property, query } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
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
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { isEventWithPath } from './exmg-custom-types';
const copyElementStyle = (source, target) => {
    const computedStyle = window.getComputedStyle(source, null);
    Array.from(computedStyle)
        .forEach(key => target.style.setProperty(key, computedStyle.getPropertyValue(key), computedStyle.getPropertyPriority(key)));
};
/**
* @namespace Exmg
*/
window.Exmg = window.Exmg || {};
const BACKSPACE = 8;
const ARROW_DOWN = 40;
const DELETE = 127;
const ESC = 27;
const debounce = (time) => {
    let timer;
    return (cb) => {
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
let PaperComboboxElement = class PaperComboboxElement extends LitElement {
    constructor() {
        super();
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
        this.attrForSelected = '';
        /**
         * Set custom max width of menu list with items
         * @type {number = 200}
         */
        this.maxWidthMenuList = 200;
        /**
         * Set to true to auto-validate the input value.
         */
        this.autoValidate = false;
        this.autofocus = false;
        /**
         * Set to true to disable this input.
         */
        this.disabled = false;
        /**
         * The error message to display when the input is invalid.
         */
        this.errorMessage = '';
        this.alwaysFloatLabel = false;
        /**
         * Set to true to mark the input as required. If you're using PaperInputBehavior to
         * implement your own paper-input-like element, bind this to
         * the `<input is="iron-input">`'s `required` property.
         */
        this.required = false;
        /**
         * This field will be bind to the actual input field.
         */
        this.inputValue = '';
        /**
         * Invalid is true if validation fails and is passed on.
         */
        this.invalid = false;
        /**
         * Focus input field if value has been set on element.
         */
        this.inputFocused = false;
        /**
         * Is menu button state open
         */
        this.opened = false;
        this.previousInsideClick = false;
        this.ignoreFocus = false;
        this.isAnyItemActive = true;
        this.isElementInitialized = false;
        this.observers = this.getObservers();
        this.keyDownBackspaceDebounce = debounce(200);
        this.inputChangeDebounce = debounce(300);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onIronResize = this.onIronResize.bind(this);
    }
    get value() {
        return this.selectedValue;
    }
    /***************** OBSERVERS *******************/
    /**
     * Register observed properties and actions to perform
     */
    getObservers() {
        return {
            inputValue: () => this.observeInputChange(),
            selectedItem: () => this.observeSelectedItem(),
            selectedValue: () => this.observeSelectedValue(),
            selected: () => this.observeSelected(),
        };
    }
    executeObservers(changedProperties) {
        Object.entries(this.observers).forEach(([key, cb]) => {
            if (cb && changedProperties.has(key)) {
                cb(changedProperties);
            }
        });
    }
    observeInputChange() {
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
                if (!this.menuElement.opened && this.isAnyItemActive && !!this.inputValue) {
                    this.menuElement.open();
                    afterNextRender(this, () => this.focus());
                }
                else if (this.menuElement.opened && !this.isAnyItemActive) {
                    this.menuElement.close();
                }
            });
        }
    }
    observeSelectedValue() {
        this.selected = this.selectedValue;
    }
    observeSelected() {
        if (this.selectedValue !== this.selected) {
            this.ignoreFocus = true;
        }
        this.selectedValue = this.selected;
    }
    observeSelectedItem() {
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
        const content = this.selectedItemSelector ?
            this.selectedItem.querySelector(this.selectedItemSelector) :
            this.selectedItem;
        const text = (content && content.textContent) || '';
        this.token = { id, text };
    }
    filterItems() {
        const items = this.querySelectorAll('paper-item, paper-icon-item');
        const hasFilterPhrase = !!this.inputValue && this.inputValue.length > 0;
        const phrase = hasFilterPhrase ? this.inputValue.toLowerCase().trim() : '';
        let isAnyItemActive = false;
        items.forEach(item => {
            if (hasFilterPhrase && item.textContent && item.textContent.toLowerCase().indexOf(phrase) === -1) {
                item.setAttribute('hidden', '');
            }
            else {
                isAnyItemActive = true;
                item.removeAttribute('hidden');
            }
        });
        return isAnyItemActive;
    }
    indexOf(item) {
        return this.listBox && this.listBox.items ? this.listBox.items.indexOf(item) : -1;
    }
    getSelectedItemKey(selectedItem) {
        if (!!this.attrForSelected) {
            return selectedItem.getAttribute(this.attrForSelected) || undefined;
        }
        const index = this.indexOf(selectedItem);
        return index === -1 ? undefined : index;
    }
    hasSelectedItem() {
        return !!this.selectedItem;
    }
    /**
      * this method can be used to set the focus of the element
      */
    focus() {
        this.inputElement.focus();
    }
    /**
      * This method will automatically set the label float.
      */
    computeAlwaysFloatLabel() {
        if (this.alwaysFloatLabel) {
            return true;
        }
        return !!this.token || this.inputFocused;
    }
    resetInput() {
        if (this.autoValidate) {
            this.validate();
        }
        this.inputValue = '';
        this.inputElement.value = '';
        if (this.ignoreFocus) {
            this.ignoreFocus = false;
        }
        else {
            this.focus();
        }
    }
    /**
     * Returns true if `value` is valid.
     * @return {boolean} True if the value is valid.
     */
    validate() {
        this.invalid = !this.disabled && this.required && !this.hasSelectedItem();
        return !this.invalid;
    }
    /************ EVENT HANDLERS *************/
    onKeyDown(e) {
        if (typeof this.inputValue !== 'string') {
            this.inputValue = '';
        }
        switch (e.code || e.keyCode) {
            case BACKSPACE:
            case 'Backspace':
            case DELETE:
            case 'Delete':
                if (!this.menuElement.opened) {
                    this.keyDownBackspaceDebounce(() => {
                        if (!this.menuElement.opened && this.isAnyItemActive) {
                            this.menuElement.open();
                            afterNextRender(this, () => this.focus());
                        }
                    });
                }
                this.selectedValue = undefined;
                this.selectedItem = undefined;
                break;
            case ARROW_DOWN:
            case 'ArrowDown':
                if (!this.menuElement.opened && this.isAnyItemActive) {
                    this.menuElement.open();
                }
                afterNextRender(this, () => this.listBox.focus());
                break;
            case ESC:
            case 'Escape':
                e.preventDefault();
                this.menuElement.close();
                afterNextRender(this, () => this.focus());
        }
    }
    onClick(e) {
        const inside = isEventWithPath(e) ? !!e.path && !!e.composedPath().find((path) => path === this) : e.target === this;
        // Detect outside element click for auto validate input
        if (this.autoValidate && (this.previousInsideClick && !inside) || this.token) {
            this.validate();
        }
        this.previousInsideClick = inside;
    }
    onContainerTap(e) {
        e.preventDefault();
        this.menuElement.open();
        afterNextRender(this, () => this.focus());
    }
    onItemSelected(e) {
        e.stopPropagation();
        this.selectedItem = e.detail.item;
        this.selected = this.getSelectedItemKey(this.selectedItem);
        this.resetInput();
    }
    onItemDeselected(e) {
        e.stopPropagation();
        this.selectedItem = undefined;
        this.selected = undefined;
        this.resetInput();
    }
    onItemActivated(e) {
        // when user select same item then don't receive iron-select event but we still want to
        // prepare input
        if (this.selected === e.detail.selected) {
            this.ignoreFocus = false;
            afterNextRender(this, () => this.resetInput());
        }
    }
    onMenuButtonOpen(e) {
        e.preventDefault();
        this.opened = true;
    }
    onMenuButtonClose(e) {
        e.preventDefault();
        this.opened = false;
    }
    onInputValueChange(e) {
        this.inputValue = e.target.value;
    }
    onInputFocusChanged(event) {
        this.inputFocused = event.detail.value;
    }
    onTokenClick() {
        this.focus();
    }
    initializeElement() {
        /* Initialize the input helper span element for determining the actual width of the input
        * text. This width will be used to create a dynamic width on the input field
        */
        if (this.inputWidthHelperElement) {
            copyElementStyle(this.inputElement, this.inputWidthHelperElement);
            this.inputWidthHelperElement.style.position = 'absolute';
            this.inputWidthHelperElement.style.top = '-999px';
            this.inputWidthHelperElement.style.left = '0';
            this.inputWidthHelperElement.style.padding = '0';
            this.inputWidthHelperElement.style.width = 'auto';
            this.inputWidthHelperElement.style.whiteSpace = 'pre';
        }
        this.inputElement.addEventListener('keydown', this.onKeyDown);
        if (this.autoValidate) {
            window.addEventListener('click', this.onClick);
        }
        this.addEventListener('iron-resize', this.onIronResize);
    }
    /**
     * Fix menu content width and height
     */
    onIronResize() {
        const element = this.menuElement.shadowRoot.querySelector('.dropdown-content');
        const { left: elementLeft } = element.getBoundingClientRect();
        const { scrollWidth: elementScrollWidth } = element;
        const getGreater = (...values) => Math.max(...values);
        const getLower = (...values) => Math.min(...values);
        if (elementScrollWidth > 0 && elementScrollWidth < this.maxWidthMenuList) {
            const elementMaximumWidthFromRight = document.documentElement.clientWidth - elementLeft;
            element.style.maxWidth = `${getLower(getGreater(elementMaximumWidthFromRight, 100), this.maxWidthMenuList)}px`;
        }
        const { top: elementTop } = element.getBoundingClientRect();
        const { scrollHeight: elementScrollHeight } = element;
        if (elementScrollHeight > 0) {
            const elementMaximumHeightToBottom = document.documentElement.clientHeight - elementTop;
            element.style.maxHeight = `${getGreater(elementMaximumHeightToBottom - 10, 100)}px`;
        }
    }
    shouldFireEvent(changedProperties) {
        const props = ['selected', 'selectedItem'];
        const anyPropChanged = props.some((it) => 
        // @ts-ignore
        changedProperties.has(it) && changedProperties.get(it) !== this[it]);
        const { id = undefined } = this.token || {};
        return (anyPropChanged && id === this.selected);
    }
    /*****  LIT ELEMENT HOOKS ******/
    async firstUpdated() {
        this.initializeElement();
        await this.updateComplete;
        this.isElementInitialized = true;
    }
    updated(changedProperties) {
        this.executeObservers(changedProperties);
        if (this.shouldFireEvent(changedProperties)) {
            if (typeof this.selected !== 'undefined') {
                const payload = {
                    value: this.selected,
                    item: this.selectedItem,
                    token: this.token,
                };
                this.dispatchEvent(new CustomEvent('exmg-combobox-select', { detail: payload, composed: true, bubbles: true }));
            }
            else {
                this.dispatchEvent(new CustomEvent('exmg-combobox-deselect', { composed: true, bubbles: true }));
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
    render() {
        return html `
      ${this.getTemplate()}
    `;
    }
    getTemplate() {
        // noinspection CssUnresolvedCustomPropertySet
        return html `
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
          margin-top: 16px;
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
      <div class="container">
        <paper-input-container
          ?always-float-label="${this.computeAlwaysFloatLabel()}"
          @tap="${this.onContainerTap}"
          ?disabled="${this.disabled}"
          ?focused="${this.inputFocused}"
          @focused-changed="${this.onInputFocusChanged}"
          ?invalid="${this.invalid}"
          id="paperInputContainer">
          <label slot="label" ?hidden="${!this.label}" aria-hidden="true">${this.label}</label>
          <iron-input bind-value="${this.inputValue}" slot="input">
            <span class="${classMap({ tokens: true, selected: !!this.token })}">
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
    renderTokenButton() {
        if (!this.token) {
            return null;
        }
        return html `<paper-button tabindex="-1" @click="${this.onTokenClick}"><span>${this.token.text}</span></paper-button>`;
    }
};
__decorate([
    property({ type: String, attribute: 'attr-for-selected' })
], PaperComboboxElement.prototype, "attrForSelected", void 0);
__decorate([
    property({ type: String, attribute: 'selected-item-selector' })
], PaperComboboxElement.prototype, "selectedItemSelector", void 0);
__decorate([
    property({ type: Object, attribute: 'selected-item' })
], PaperComboboxElement.prototype, "selectedItem", void 0);
__decorate([
    property({ type: String })
], PaperComboboxElement.prototype, "selected", void 0);
__decorate([
    property({ type: Number, attribute: 'max-width-menu-list' })
], PaperComboboxElement.prototype, "maxWidthMenuList", void 0);
__decorate([
    property({ type: String })
], PaperComboboxElement.prototype, "selectedValue", void 0);
__decorate([
    property({ type: String })
], PaperComboboxElement.prototype, "label", void 0);
__decorate([
    property({ type: Boolean, attribute: 'auto-validate' })
], PaperComboboxElement.prototype, "autoValidate", void 0);
__decorate([
    property({ type: Boolean })
], PaperComboboxElement.prototype, "autofocus", void 0);
__decorate([
    property({ type: Boolean })
], PaperComboboxElement.prototype, "disabled", void 0);
__decorate([
    property({ type: String, attribute: 'error-message' })
], PaperComboboxElement.prototype, "errorMessage", void 0);
__decorate([
    property({ type: Boolean, attribute: 'always-float-label' })
], PaperComboboxElement.prototype, "alwaysFloatLabel", void 0);
__decorate([
    property({ type: Boolean })
], PaperComboboxElement.prototype, "required", void 0);
__decorate([
    property({ type: String })
], PaperComboboxElement.prototype, "name", void 0);
__decorate([
    property({ type: String, attribute: 'input-value' })
], PaperComboboxElement.prototype, "inputValue", void 0);
__decorate([
    property({ type: Object })
], PaperComboboxElement.prototype, "token", void 0);
__decorate([
    property({ type: Boolean })
], PaperComboboxElement.prototype, "invalid", void 0);
__decorate([
    property({ type: Boolean, attribute: 'input-focused' })
], PaperComboboxElement.prototype, "inputFocused", void 0);
__decorate([
    property({ type: Boolean })
], PaperComboboxElement.prototype, "opened", void 0);
__decorate([
    query('#listbox')
], PaperComboboxElement.prototype, "listBox", void 0);
__decorate([
    query('#inputValue')
], PaperComboboxElement.prototype, "inputElement", void 0);
__decorate([
    query('#inputWidthHelper')
], PaperComboboxElement.prototype, "inputWidthHelperElement", void 0);
__decorate([
    query('#menu')
], PaperComboboxElement.prototype, "menuElement", void 0);
PaperComboboxElement = __decorate([
    customElement('exmg-paper-combobox')
], PaperComboboxElement);
export { PaperComboboxElement };
window.Exmg.PaperComboboxElement = PaperComboboxElement;
