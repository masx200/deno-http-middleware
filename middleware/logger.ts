import { Context } from "../src/Context.ts";
import { NextFunction, RetHandler } from "../src/Middleware.ts";

export const logger = async function (
    context: Context,
    next: NextFunction,
): Promise<RetHandler> {
    const { response: _b, request, ...rest } = context;
    const { url, method, headers } = request;

    console.log("context", {
        ...rest,
    });
    console.log("request", {
        url,
        method,
        headers: Object.fromEntries(headers),
    });

    await next();
    const { response } = context;
    console.log("response", {
        url: request.url,
        status: response.status,
        method,
        headers: Object.fromEntries(response.headers),
    });
};
