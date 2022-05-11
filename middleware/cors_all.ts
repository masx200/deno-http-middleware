import { ResponseOptions } from "../src/Context.ts";
import { Middleware, RetHandler } from "../src/Middleware.ts";

export const cors_all: Middleware = async function (
    context,
    next
): Promise<RetHandler> {
    const { response, request } = context;
    set_header(response);
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: new Headers(response.headers),
        });
    } else {
        await next();
        set_header(context.response);
    }

    function set_header(response: ResponseOptions | Response) {
        response.headers.append("access-control-allow-origin", "*");
        response.headers.append("Access-Control-Allow-Methods", "*");
        response.headers.append("Access-Control-Allow-Headers", "*");
    }
};
