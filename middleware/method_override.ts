import { METHODS } from "../deps.ts";
import { Context } from "../src/Context.ts";
import { Middleware, RetHandler } from "../src/Middleware.ts";
const context_to_original_Method = new WeakMap<Context, string>();

export function get_original_Method(ctx: Context): string | undefined {
    return context_to_original_Method.get(ctx);
}
export const method_override: (
    options?: Partial<{
        getter: (
            request: Request,
        ) => Promise<string | undefined | null> | string | undefined | null;
        methods: string[];
    }>,
) => Middleware = (options = {}) => {
    const methods = options.methods ?? ["POST"];
    const getter = options.getter ??
        ((request: Request) => {
            return request.headers.get("X-HTTP-Method-Override");
        });
    return async function (context, next): Promise<RetHandler> {
        const originalMethod = context_to_original_Method.get(context) ??
            context.request.method;
        if (!context_to_original_Method.has(context)) {
            context_to_original_Method.set(context, originalMethod);
        }
        const method = await getter(context.request);
        if (methods && methods.indexOf(originalMethod) === -1) {
            return next();
        } else if (method !== undefined && method && supports(method)) {
            return { request: { method: method.toUpperCase() } };
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
