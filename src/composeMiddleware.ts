import { Middleware } from "./Middleware.ts";
import { RetProcessor } from "./RetProcessor.ts";

export function composeMiddleware(
    middleware: Array<Middleware>,
    ret_processor: RetProcessor,
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
    ): Promise<void> {
        let index = -1;
        await dispatch(0);

        async function dispatch(i: number): Promise<void> {
            if (i <= index) throw new Error("next() called multiple times");

            index = i;
            const fn = middleware[i];
            if (i === middleware.length) return await next();
            if (!fn) throw new Error("middleware is not function");
            try {
                const ne = async function (): Promise<void> {
                    await dispatch.bind(null, i + 1)();
                };
                const ret_handler = await fn(context, ne);
                await ret_processor(ret_handler, context, ne);
            } catch (err) {
                throw err;
            }
        }
    };
    return ComposedMiddleware;
}
