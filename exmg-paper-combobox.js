import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
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

/**
* @namespace Exmg
*/
window.Exmg = window.Exmg || {};

const BACKSPACE = 8;
const ARROWDOWN = 40;
const DELETE = 127;

/**
* `exmg-paper-combobox` is an wrapper element to make list data selectable.
* The Element comes with options to make the list required, disabled and/or auto-validate.
* Lists should consist of id's and names and can have images.
* ```
* <exmg-paper-combobox label="Creatives" selected="{{creativesToAdd}}" required>
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
* @extends Polymer.Element
* @summary Paper Combobox Element
*/
class PaperComboboxElement extends PolymerElement {
  static get is() {
    return 'exmg-paper-combobox';
  }
  static get properties() {
    return {
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
      attrForSelected: {
        type: String,
        value: null
      },

      /**
        * By default the textContent of the paper-item/paper-icon-item or paper-item-body
        * will be used for display in badge after selection. In case of icon and body
        * you probably want an alternative. The selector can be used to be a bit more
        * specific on which element can be used for display purposes.
        */
      selectedItemSelector: {
        type: String,
        value: null
      },

      /**
      * Returns currently selected item.
      * @type {?Object}
      */
      selectedItem: {
        type: Object,
        notify: true,
      },

      /**
      * Gets or sets the selected element. The default is to use the index of the item.
      * @type {string|number}
      */
      selected: {
        type: String,
        notify: true,
        observer: '_observeSelected',
      },

      _selectedValue: {
        type: String,
        observer: '_observeSelectedValue',
      },

      /**
      * The label for this input.
      */
      label: String,

      /**
        * Set to true to auto-validate the input value.
        */
      autoValidate: {
        type: Boolean,
        value: false
      },

      autofocus: {
        type: Boolean
      },

      /**
      * Set to true to disable this input.
      */
      disabled: {
        type: Boolean,
        value: false
      },

      /**
      * The error message to display when the input is invalid.
      */
      errorMessage: {
        type: String
      },

      /**
      * alwaysFloatLabel
      */
      alwaysFloatLabel: {
        type: Boolean,
        value: false
      },

      /**
        * Set to true to mark the input as required. If you're using PaperInputBehavior to
        * implement your own paper-input-like element, bind this to
        * the `<input is="iron-input">`'s `required` property.
        */
      required: {
        type: Boolean,
        value: false
      },

      /**
      * This field will be bind to the actual input field.
      */
      _inputValue: {
        type: String,
        value: '',
      },

      _token: {
        type: Object,
        value: () => {},
      },

      /**
      * Invalid is true if validation fails and is passed on.
      */
      invalid: {
        type: Boolean,
      },

      /**
      * Focus input field if value has been set on element.
      */
      inputFocused: {
        type: Boolean,
      },
    };
  }

  static get observers() {
    return [
      '_observeInputChange(_inputValue)',
      '_observeSelectedItem(selectedItem)',
    ];
  }

  _observeSelectedValue(selectedValue) {
    this.set('selected', selectedValue);
  }

  _observeSelected(selected) {
    if (this._selectedValue !== selected) {
      this._ignoreFocus = true;
    }
    this.set('_selectedValue', selected);
  }

  static get template() {
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
          padding: 8px 0;
        }
        paper-icon-button {
          margin: 8px 0;
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
          always-float-label="[[_computeAlwaysFloatLabel(_token, alwaysFloatLabel)]]"
          on-tap="_handleContainerTap"
          disabled$="[[disabled]]"
          focused="{{inputFocused}}"
          invalid="[[invalid]]"
          id="paperInputContainer">
          <label slot="label" hidden$="[[!label]]" aria-hidden="true">[[label]]</label>
          <iron-input bind-value="{{_inputValue}}" slot="input">
            <span class$="tokens [[_tokenSetClass(_token)]]">
              <template is="dom-if" if="[[_token]]">
                <paper-button tabindex="-1" on-click="_handleTokenClick"><span>[[_token.text]]</span></paper-button>
              </template>
              <input
                id="inputValue"
                aria-labelledby="label"
                value="{{_inputValue::input}}"
                autofocus$="[[autofocus]]"
                autocomplete="off"
                disabled$="[[disabled]]">
            </span>
          </iron-input>
          <paper-input-error slot="add-on" aria-live="assertive">[[errorMessage]]</paper-input-error>
        </paper-input-container>

        <span id="inputWidthHelper">[[_inputValue]] </span>

        <paper-menu-button id="menu" opened="{{opened}}" disabled$="[[disabled]]"
          close-on-activate vertical-offset="60" horizontal-align="right">
          <paper-icon-button icon="exmg-paper-combobox-icons:arrow-drop-down" data-opened$="[[opened]]" slot="dropdown-trigger">
          </paper-icon-button>
          <paper-listbox
            id="listbox"
            slot="dropdown-content"
            selectable="paper-item:not([hidden]),paper-icon-item:not([hidden])"
            attr-for-selected="{{attrForSelected}}"
            selected="{{_selectedValue}}"
            class="dropdown-content"
            on-iron-select="_handleAddToken" on-iron-deselect="_resetInput">
            <slot></slot>
          </paper-listbox>
        </paper-dropdown-menu>
      </div>
    `;
  }

  constructor() {
    super();
    this._boundKeyDown = this._handleKeyDown.bind(this);
    this._boundOutsideClick = this._handleClick.bind(this);
  }

  _tokenSetClass(token) {
    return token ? 'selected' : '';
  }

  _observeInputChange(_inputValue) {
    this.$.inputValue.style.width = (this.$.inputWidthHelper.offsetWidth + 10) + 'px';
    this._filterItems();
  }

  _filterItems() {
    const items = this.querySelectorAll('paper-item, paper-icon-item');
    for (var i = 0; i < items.length; i++) {
      if (this._inputValue.length > 0 && items[i].textContent.indexOf(this._inputValue) === -1) {
        items[i].setAttribute('hidden', '');
      } else {
        items[i].removeAttribute('hidden');
      }
    }
  }

  _observeSelectedItem(selectedItem) {
    if (!selectedItem) {
      this.set('_token', null);
      return;
    }

    const id = this.attrForSelected ?
      selectedItem.getAttribute(this.attrForSelected) :
      this.indexOf(selectedItem);

    const text = this.selectedItemSelector ?
      selectedItem.querySelector(this.selectedItemSelector).textContent :
      selectedItem.textContent;

    this.set('_token', {id, text});
  }

  _handleTokenClick() {
    this.focus();
  }

  indexOf(item) {
    return this.$.listbox.items ? this.$.listbox.items.indexOf(item) : -1;
  }

  _handleClick(e) {
    const inside = e.path.find((path) => path === this);

    // Detect outside element click for auto validate input
    if (this.autoValidate && (this.previousInsideClick && !inside) || this._token) {
      this.validate();
    }
    this.previousInsideClick = inside;
  }

  connectedCallback() {
    super.connectedCallback();
    /* Initialize the input helper span element for determining the actual width of the input
      text. This width will be used to create a dynamic width on the input field */
    this.$.inputWidthHelper.style = window.getComputedStyle(this.$.inputValue, null).cssText;
    this.$.inputWidthHelper.style.position = 'absolute';
    this.$.inputWidthHelper.style.top = '-999px';
    this.$.inputWidthHelper.style.left = '0';
    this.$.inputWidthHelper.style.padding = '0';
    this.$.inputWidthHelper.style.width = 'auto';
    this.$.inputWidthHelper.style['white-space'] = 'pre';

    this.$.inputValue.addEventListener('keydown', this._boundKeyDown);
    if (this.autoValidate) {
      window.addEventListener('click', this._boundOutsideClick);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.$.inputValue.removeEventListener('keydown', this._boundKeyDown);
    if (this.autoValidate) {
      window.removeEventListener('click', this._boundOutsideClick);
    }
  }

  _handleKeyDown(e) {
    this._inputValue = this._inputValue || '';
    switch (e.keyCode) {
      case BACKSPACE:
      case DELETE:
        this.opened = true;
        this.set('_selectedValue', null);
        this.set('selectedItem', null);
        afterNextRender(this, _ => this.focus());
        break;
      case ARROWDOWN:
        this.opened = true;
        this.$.listbox.focus();
        break;
    }
  }

  _hasSelectedItem() {
    return !!this.selectedItem;
  }

  /**
    * this method can be used to set the focus of the element
    *
    * @method indexOf
    */
  focus() {
    this.$.inputValue.focus();
  }

  /**
    * This method will automaticly set the label float.
    */
  _computeAlwaysFloatLabel(_token, alwaysFloatLabel) {
    if (alwaysFloatLabel) {
      return true;
    }
    return !(!_token && this.$.inputValue !== document.activeElement);
  }

  _handleContainerTap(e) {
    this.opened = true;
    afterNextRender(this, _ => this.focus());
  }

  _handleAddToken(e) {
    this.set('selectedItem',  e.detail.item);
    e.stopPropagation();
    this._resetInput();
  }

  _resetInput() {
    if (this.autoValidate) {
      this.validate();
    }
    this.set('_inputValue', '');
    if (this._ignoreFocus) {
      this._ignoreFocus = false;
    } else {
      this.focus();
    }
  }

  /**
  * Returns true if `value` is valid.
  * @return {boolean} True if the value is valid.
  */
  validate() {
    this.invalid = this.required && !this._hasSelectedItem();
    return !this.invalid;
  }
}

window.customElements.define(PaperComboboxElement.is, PaperComboboxElement);

Exmg.PaperComboboxElement = PaperComboboxElement;

