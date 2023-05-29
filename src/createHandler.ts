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
export function getOriginalRequest(ctx: Context): Request | undefined {
    return context_to_original_Request.get(ctx);
}
export const context_to_original_Options = new WeakMap<Context<any>, any>();
export function getOriginalOptions<T = {}>(ctx: Context<T>): T | undefined {
    return context_to_original_Options.get(ctx);
}

export function handler<T = {}>(
    ...middleware: Array<Middleware<T>> | Array<Middleware<T>>[]
): Handler<T> {
    return createHandler(middleware.flat());
}
export type Handler<T = {}> = (
    request: Request,
    options?: T,
) => Promise<Response>;

// deno-lint-ignore no-explicit-any
export function createHandler<T = {}>(
    middleware: Middleware<T>[] | Middleware<T> = [],
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
): Handler<T> {
    const composed = composeMiddleware(
        typeof middleware === "function" ? [middleware] : middleware,
        retProcessor,
    );
    return async function (
        request: Request,
        options: T = {} as T,
    ): Promise<Response> {
        const context: Context<T> = createContext(request, options);
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
