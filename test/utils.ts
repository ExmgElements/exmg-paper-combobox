import {LitElement} from 'lit-element';

export const promisifyFlush = (flush: Function) => () => new Promise(resolve => flush(resolve));

const onEvent: (eventName: string) => (element: LitElement) => Promise<any> =
  (eventName: string) => (element: LitElement) => new Promise(resolve => {
    element.addEventListener(eventName, (event: Event) => resolve(event));
  });

export const onExmgComboboxSelected: (element: LitElement) => Promise<any> = onEvent('exmg-combobox-select');

export const onExmgComboboxDeselected: (element: LitElement) => Promise<any> = onEvent('exmg-combobox-deselect');
