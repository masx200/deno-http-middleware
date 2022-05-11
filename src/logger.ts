import { Context } from "./Context.ts";
import { NextFunction, RetHandler } from "./Middleware.ts";

export const logger = async function (
    context: Context,
    next: NextFunction,
): Promise<RetHandler> {
    //console.log(context.connInfo);
    const { request } = context;
    const { url, method, headers } = request;
    console.log({
        ...context.connInfo,
        url,
        method,
        headers: Object.fromEntries(headers),
    });

    await next();
    const { response } = context;
    console.log({
        url: request.url,
        status: response.status,
        headers: Object.fromEntries(response.headers),
    });
    return response;
};
