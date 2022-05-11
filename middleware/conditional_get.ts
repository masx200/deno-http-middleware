import { fresh } from "../deps.ts";
import { Context } from "../src/Context.ts";
import { NextFunction, RetHandler } from "../src/Middleware.ts";

export async function conditional_get(
    context: Context,
    next: NextFunction,
): Promise<RetHandler> {
    await next();
    const { request, response } = context;
    const reqHeaders = Object.fromEntries(request.headers);
    const resHeaders = Object.fromEntries(response.headers);
    const s = response.status;
    if ((s >= 200 && s < 300) || 304 === s) {
        if (
            ["GET", "HEAD"].includes(request.method) &&
            ((response.headers.get("etag") &&
                response.headers.get("etag") ===
                    request.headers.get("if-none-match")) ||
                fresh(reqHeaders, resHeaders))
        ) {
            const { headers } = response;
            return new Response(null, { headers, status: 304 });
        }
    }

    return response;
}
