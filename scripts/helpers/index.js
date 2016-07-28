/**
 * Omit special characters from the string
 * @param string
 */
export const escape = string => undefined === string ? null : string.replace(/[^a-zA-Z0-9\-\_\.\ ]/g, '');

/**
 * Remove trailing slash(/) from the url
 * @param url
 */
export const normalizeUrl = url => url.replace(/\/+$/, "");

/**
 * Get the user from the response
 * @param res
 */
export const getUser = res => res.envelope.user || res.envelope;

/**
 * Get the room of the chat application from the response
 * @param res
 */
export const getRoom = res => res.envelope.room;
