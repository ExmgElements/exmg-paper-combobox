export const isEventWithPath = (event) => {
    return !!event && !!event.path && Array.isArray(event.path);
};
