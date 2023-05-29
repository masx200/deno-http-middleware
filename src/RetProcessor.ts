import { Context } from "./Context.ts";
import { NextFunction, RetHandler } from "./Middleware.ts";
import { updateRequest } from "./updateRequest.ts";
import { updateResponse } from "./updateResponse.ts";

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
