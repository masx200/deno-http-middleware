import { cloneResponseMutableHeaders } from "../response/cloneResponseMutableHeaders.ts";
import { Context, RequestOptions } from "./Context.ts";
import {
    NextFunction,
    RequestOptionsPartial,
    ResponseOptionsPartial,
    RetHandler,
} from "./Middleware.ts";
import { request_to_options } from "./request_to_options.ts";

export function updateResponse(
    context: Context,
    response: Response | ResponseOptionsPartial,
) {
    const {
        headers = context.response.headers,
        status = context.response.status,
        body = context.response.body,
        statusText = context.response.statusText,
    } = response;
    context.response = cloneResponseMutableHeaders({
        headers: headers instanceof Headers ? headers : new Headers(headers),
        status,
        body,
        statusText,
    });
}
export function updateRequest(
    context: Context,
    request: Request | RequestOptionsPartial,
) {
    const {
        url = context.request.url,
        headers = context.request.headers,
        method = context.request.method,
        body = context.request.body,
    } = request;
    const options: RequestOptions = request_to_options({
        url,
        headers,
        method,
        body,
    });
    context.request = options;
}
export type RetProcessor = (
    ret_handler: RetHandler,
    context: Context,
    next: NextFunction,
) => Promise<void> | void;
export const ret_processor: RetProcessor = async (ret, context, next) => {
    /* headers 可能是不可变的 */
    if ("object" !== typeof ret) return;
    if (ret instanceof Response) {
        updateResponse(context, ret);
        return;
    }
    if (ret instanceof Request) {
        updateRequest(context, ret);
        return;
    }
    if (typeof ret.request === "object") {
        updateRequest(context, ret.request);
    }
    if (typeof ret.response === "object") {
        updateResponse(context, ret.response);
    }
    const keys = Object.keys(ret);
    if (
        keys.length &&
        ["headers", "status", "body", "statusText"].some((key) =>
            keys.includes(key)
        )
    ) {
        updateResponse(context, ret);
    }
    if (ret.next) {
        await next();
    }
};
