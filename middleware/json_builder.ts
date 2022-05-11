import { isPlainObject } from "../deps.ts";
import { JSONResponse } from "../response/JSONResponse.ts";

import { Middleware, RetHandler } from "../src/Middleware.ts";

export const json_builder: Middleware = async function (
    context,
    next,
): Promise<RetHandler> {
    await next();
    const { response } = context;
    const { body } = response;

    return response instanceof Response
        ? response
        : Array.isArray(body) || isPlainObject(body)
        ? await JSONResponse(response)
        : void 0;
};
