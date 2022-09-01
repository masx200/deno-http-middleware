// deno-lint-ignore-file ban-types

import { cloneResponseMutableHeaders } from "../response/cloneResponseMutableHeaders.ts";
import { composeMiddleware } from "./composeMiddleware.ts";
import { Context } from "./Context.ts";
import { error_handler } from "./error_handler.ts";
import { ErrorHandler } from "./ErrorHandler.ts";
import { Middleware, RetHandler } from "./Middleware.ts";
import { notfound_handler } from "./notfound_handler.ts";
import { NotFoundHandler } from "./NotFoundHandler.ts";
import { request_to_options } from "./request_to_options.ts";
import { response_builder, ResponseBuilder } from "./response_builder.ts";
import { ret_processor, RetProcessor } from "./RetProcessor.ts";

const context_to_original_Request = new WeakMap<Context, Request>();
export function getOriginalRequest(ctx: Context): Request | undefined {
    return context_to_original_Request.get(ctx);
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
export function createContext<T = {}>(
    request: Request,
    options: T = {} as T,
): Context<T> {
    const response = cloneResponseMutableHeaders(new Response());
    const context = {
        request: request_to_options(request),
        arguments: { request, options: options },
        response,
        ...options,
    };
    context_to_original_Request.set(context, request);
    return context as Context<T>;
}
