import { Context, RequestOptions } from "../src/Context.ts";
import { Middleware, RetHandler } from "../src/Middleware.ts";

import { METHODS } from "../deps.ts";
import { getOriginalRequest } from "../src/getOriginalRequest.ts";

export function getOriginalMethod(ctx: Context): string | undefined {
    return getOriginalRequest(ctx)?.method;
}
export const method_override: (
    options?: Partial<{
        getter: (
            request: RequestOptions,
        ) => Promise<string | undefined | null> | string | undefined | null;
        methods: string[];
    }>,
) => Middleware = (options = {}) => {
    const methods = options.methods ?? ["POST"];
    const getter = options.getter ??
        ((request: RequestOptions) => {
            return request.headers.get("X-HTTP-Method-Override");
        });
    return async function (context, next): Promise<RetHandler> {
        const originalMethod = getOriginalMethod(context) ??
            context.request.method;

        const method = await getter(context.request);
        if (methods && methods.indexOf(originalMethod) === -1) {
            return next();
        } else if (method !== undefined && method && supports(method)) {
            return {
                request: {
                    method: method.toUpperCase(),
                },
                next: true,
            };
        } else {
            return next();
        }
    };
};
function supports(method: string) {
    return (
        method &&
        typeof method === "string" &&
        METHODS.indexOf(method.toUpperCase()) !== -1
    );
}
