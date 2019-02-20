import { LitElement } from 'lit-element';
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
import { GenericPropertyValues } from './exmg-custom-types';
declare type PrivateProps = 'inputValue' | 'selectedValue';
declare type Props = Exclude<keyof PaperComboboxElement, number | Symbol> | PrivateProps;
declare type ChangedProps = GenericPropertyValues<Props>;
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
export declare class PaperComboboxElement extends LitElement {
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
    attrForSelected: string;
    /**
     * By default the textContent of the paper-item/paper-icon-item or paper-item-body
     * will be used for display in badge after selection. In case of icon and body
     * you probably want an alternative. The selector can be used to be a bit more
     * specific on which element can be used for display purposes.
     */
    selectedItemSelector?: string;
    /**
     * Returns currently selected item.
     * @type {?Object}
     */
    selectedItem?: Element;
    /**
     * Gets or sets the selected element. The default is to use the index of the item.
     * @type {string|number}
     */
    selected?: string | number;
    /**
     * Set custom max width of menu list with items
     * @type {number = 200}
     */
    maxWidthMenuList: number;
    private selectedValue?;
    /**
     * The label for this input.
     */
    label?: string;
    /**
     * Set to true to auto-validate the input value.
     */
    autoValidate: boolean;
    autofocus: boolean;
    /**
     * Set to true to disable this input.
     */
    disabled: boolean;
    /**
     * The error message to display when the input is invalid.
     */
    errorMessage?: string;
    alwaysFloatLabel: boolean;
    /**
     * Set to true to mark the input as required. If you're using PaperInputBehavior to
     * implement your own paper-input-like element, bind this to
     * the `<input is="iron-input">`'s `required` property.
     */
    required: boolean;
    name?: string;
    /**
     * This field will be bind to the actual input field.
     */
    private inputValue;
    private token?;
    /**
     * Invalid is true if validation fails and is passed on.
     */
    invalid: boolean;
    /**
     * Focus input field if value has been set on element.
     */
    inputFocused: boolean;
    /**
     * Is menu button state open
     */
    private opened;
    private listBox?;
    private inputElement?;
    private inputWidthHelperElement?;
    private menuElement?;
    private previousInsideClick;
    private ignoreFocus;
    private isAnyItemActive;
    private isElementInitialized;
    private readonly observers;
    private readonly keyDownBackspaceDebounce;
    private readonly inputChangeDebounce;
    constructor();
    readonly value: string | number | undefined;
    /***************** OBSERVERS *******************/
    /**
     * Register observed properties and actions to perform
     */
    private getObservers;
    private executeObservers;
    private observeInputChange;
    private observeSelectedValue;
    private observeSelected;
    private observeSelectedItem;
    filterItems(): boolean;
    indexOf(item: any): number;
    private getSelectedItemKey;
    private hasSelectedItem;
    /**
      * this method can be used to set the focus of the element
      */
    focus(): void;
    /**
      * This method will automatically set the label float.
      */
    private computeAlwaysFloatLabel;
    private resetInput;
    /**
     * Returns true if `value` is valid.
     * @return {boolean} True if the value is valid.
     */
    validate(): boolean;
    /************ EVENT HANDLERS *************/
    private onKeyDown;
    private onClick;
    private onContainerTap;
    private onItemSelected;
    private onItemDeselected;
    private onItemActivated;
    private onMenuButtonOpen;
    private onMenuButtonClose;
    private onInputValueChange;
    private onInputFocusChanged;
    private onTokenClick;
    private initializeElement;
    /**
     * Fix menu content width and height
     */
    private onIronResize;
    private shouldFireEvent;
    /*****  LIT ELEMENT HOOKS ******/
    protected firstUpdated(): Promise<void>;
    protected updated(changedProperties: ChangedProps): void;
    disconnectedCallback(): void;
    protected render(): import("lit-element").TemplateResult;
    private getTemplate;
    private renderTokenButton;
}
export {};
