export const escape = string => undefined === string ? null : string.replace(/[^a-zA-Z0-9\-\_\.\ ]/g, '');
export const normalizeUrl = url => url.replace(/\/+$/, "");
