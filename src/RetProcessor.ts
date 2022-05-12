import { cloneResponseMutableHeaders } from "../response/cloneResponseMutableHeaders.ts";
import { Context } from "./Context.ts";
import { NextFunction, RetHandler } from "./Middleware.ts";

export type RetProcessor = (
    ret_handler: RetHandler,
    context: Context,
    next: NextFunction,
) => Promise<void> | void;
export const ret_processor: RetProcessor = async (ret, context, next) => {
    /* headers 可能是不可变的 */
    if (!ret) return;
    if (ret instanceof Response) {
        context.response = cloneResponseMutableHeaders(ret);
        return;
    }
    if (ret instanceof Request) {
        context.request = ret;
        return;
    }
    if (ret.request instanceof Request) {
        context.request = ret.request;
    } else if (typeof ret.request === "object") {
        const {
            url = context.request.url,
            headers = context.request.headers,
            method = context.request.method,
            body = context.request.body,
        } = ret.request;
        context.request = new Request(url, { headers, method, body });
    }
    if (ret.response instanceof Response) {
        context.response = cloneResponseMutableHeaders(ret.response);
    } else if (typeof ret.response === "object") {
        const {
            headers = context.response.headers,
            status = context.response.status,
            body = context.response.body,
            statusText = context.response.statusText,
        } = ret.response;
        context.response = cloneResponseMutableHeaders({
            headers: headers instanceof Headers
                ? headers
                : new Headers(headers),
            status,
            body,
            statusText,
        });
    }
    const keys = Object.keys(ret);
    if (
        keys.length &&
        ["headers", "status", "body", "statusText"].some((key) =>
            keys.includes(key)
        )
    ) {
        const {
            headers = context.response.headers,
            status = context.response.status,
            body = context.response.body,
            statusText = context.response.statusText,
        } = ret;
        context.response = cloneResponseMutableHeaders({
            headers: headers instanceof Headers
                ? headers
                : new Headers(headers),
            status,
            body,
            statusText,
        });
    }
    if (ret.next) {
        await next();
    }
};
