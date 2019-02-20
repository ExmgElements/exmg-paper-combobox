export const promisifyFlush = (flush) => () => new Promise(resolve => flush(resolve));
const onEvent = (eventName) => (element) => new Promise(resolve => {
    element.addEventListener(eventName, (event) => resolve(event));
});
export const onExmgComboboxSelected = onEvent('exmg-combobox-select');
export const onExmgComboboxDeselected = onEvent('exmg-combobox-deselect');
