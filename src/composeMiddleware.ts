// deno-lint-ignore no-explicit-any
// deno-lint-ignore-file ban-types
import { ResponseOptions } from "./Context.ts";
import { Middleware, RetHandler } from "./Middleware.ts";
import { ret_processor, RetProcessor } from "./RetProcessor.ts";

/**
 * compose middleware
https://github.com/koajs/compose
*/
export function composeMiddleware(
    middleware: Array<Middleware>,
    ret_processor_fn: RetProcessor = ret_processor,
): Middleware {
    if (!Array.isArray(middleware)) {
        throw new TypeError("Middleware stack must be an array!");
    }
    for (const fn of middleware) {
        if (typeof fn !== "function") {
            throw new TypeError("Middleware must be composed of functions!");
        }
    }
    if (middleware.length === 0) {
        const result: Middleware = async (_context, next) => {
            await next();
        };
        return result;
    }
    const ComposedMiddleware: Middleware = async function (
        context,
        next,
    ): Promise<RetHandler> {
        let index = -1;
        await dispatch(0);

        async function dispatch(i: number): Promise<RetHandler> {
            if (i <= index) throw new Error("next() called multiple times");

            index = i;
            const fn = middleware[i];
            if (i === middleware.length) return await next();
            if (!fn) throw new Error("middleware is not function");
            try {
                const ne = async function (): Promise<ResponseOptions> {
                    await dispatch.bind(null, i + 1)();
                    return context.response;
                };
                const ret_handler = await fn(context, ne);
                await ret_processor_fn(ret_handler, context, ne);
            } catch (err) {
                throw err;
            }
        }
    };
    return ComposedMiddleware;
}
// deno-lint-ignore no-explicit-any
export function compose(
    ...middleware: Array<Middleware> | Array<Middleware>[]
): Middleware {
    return composeMiddleware(middleware.flat());
}
