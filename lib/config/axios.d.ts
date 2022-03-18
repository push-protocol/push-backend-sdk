/**
 * A function used to make get requests throughout the entire application
 * @param {String} path e.g /feeds/get_feeds, this represents the route of the enpoint to call
 * @returns {Promise}
 */
export declare const getReq: (path: string) => Promise<import("axios").AxiosResponse<any, any>>;
/**
 * A function used to make post requests to the backend
 * @param {String} path e.g /feeds/get_feeds, this represents the route of the enpoint to call
 * @param {Object} obj
 * @returns {Promise}
 */
export declare const postReq: (path: string, obj: any) => Promise<import("axios").AxiosResponse<any, any>>;
