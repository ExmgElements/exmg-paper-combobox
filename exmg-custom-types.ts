// it just create better type definition than lit-element type PropertyValues
// now editor should show what kind of field names are allowed
export type GenericPropertyValues<T, V = unknown> = Map<T, V>;

export interface EventWithPath extends Event {
    path: HTMLElement[];
}

export const isEventWithPath = (event: any): event is EventWithPath => {
    return !!event && !!event.path && Array.isArray(event.path);
};

export type Token = {
    id: number | string;
    text: string;
};
