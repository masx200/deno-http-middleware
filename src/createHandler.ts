// deno-lint-ignore-file ban-types

import { composeMiddleware } from "./composeMiddleware.ts";
import { Context } from "./Context.ts";
import { createContext } from "./createContext.ts";
import { error_handler } from "./error_handler.ts";
import { ErrorHandler } from "./ErrorHandler.ts";
import { Middleware, RetHandler } from "./Middleware.ts";
import { notfound_handler } from "./notfound_handler.ts";
import { NotFoundHandler } from "./NotFoundHandler.ts";
import { response_builder, ResponseBuilder } from "./response_builder.ts";
import { ret_processor, RetProcessor } from "./RetProcessor.ts";

export const context_to_original_Request = new WeakMap<Context, Request>();
export const context_to_original_Options = new WeakMap<Context, any>();
export function handler(
    ...middleware: Array<Middleware> | Array<Middleware>[]
): Handler {
    return createHandler(middleware.flat());
}
export type Handler = (
    request: Request,
    options?: any,
) => Promise<Response>;

// deno-lint-ignore no-explicit-any
export function createHandler(
    middleware: Middleware[] | Middleware = [],
    {
        notfoundHandler = notfound_handler,
        errorHandler = error_handler,
        responseBuilder = response_builder,
        retProcessor = ret_processor,
    }: {
        notfoundHandler?: NotFoundHandler;
        errorHandler?: ErrorHandler;
        responseBuilder?: ResponseBuilder;
        retProcessor?: RetProcessor;
    } = {},
): Handler {
    const composed = composeMiddleware(
        typeof middleware === "function" ? [middleware] : middleware,
        retProcessor,
    );
    return async function (
        request: Request,
        options: any = {},
    ): Promise<Response> {
        const context: Context = createContext(request, options);
        const next = async () => {
            context.response = await notfoundHandler(context);
            return context.response;
        };
        try {
            const ret_handler: RetHandler = await composed(context, next);
            await retProcessor(ret_handler, context, next);
        } catch (error) {
            context.response = await errorHandler(error, context);
        }
        if (context.response instanceof Response) {
            return context.response;
        } else {
            return await responseBuilder(context.response);
        }
    };
}
