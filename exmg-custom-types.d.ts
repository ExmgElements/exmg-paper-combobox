export declare type GenericPropertyValues<T, V = unknown> = Map<T, V>;
export interface EventWithPath extends Event {
    path: HTMLElement[];
}
export declare const isEventWithPath: (event: any) => event is EventWithPath;
export declare type Token = {
    id: number | string;
    text: string;
};
export declare type EventSelectPayload = {
    value: number | string;
    item: Element;
    token: Token;
};
