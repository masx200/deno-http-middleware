import { ResponseOptions } from "../src/Context.ts";
import { Middleware, RetHandler } from "../src/Middleware.ts";

export const cors_all_get: Middleware = async function (
    context,
    next,
): Promise<RetHandler> {
    set_header(context.response);

    await next();
    set_header(context.response);

    function set_header(response: ResponseOptions | Response) {
        response.headers.set("access-control-allow-origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "*");
        response.headers.set("Access-Control-Allow-Headers", "*");
    }
};
