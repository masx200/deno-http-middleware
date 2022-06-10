import { ConnInfo, Handler } from "../deps.ts";
import { cloneResponseMutableHeaders } from "../response/cloneResponseMutableHeaders.ts";
import { composeMiddleware } from "./composeMiddleware.ts";
import { Context } from "./Context.ts";

import { ErrorHandler } from "./ErrorHandler.ts";
import { error_handler } from "./error_handler.ts";

import { Middleware, RetHandler } from "./Middleware.ts";
import { NotFoundHandler } from "./NotFoundHandler.ts";
import { notfound_handler } from "./notfound_handler.ts";
import { request_to_options } from "./request_to_options.ts";
import { response_builder, ResponseBuilder } from "./response_builder.ts";
import { ret_processor, RetProcessor } from "./RetProcessor.ts";
const context_to_original_Request = new WeakMap<Context, Request>();
export function get_original_Request(ctx: Context): Request | undefined {
    return context_to_original_Request.get(ctx);
}
export function createHandler(
    middleware: Middleware[] = [],
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
    const composed = composeMiddleware(middleware, retProcessor);
    return async function (
        request: Request,
        connInfo: ConnInfo,
    ): Promise<Response> {
        const response = cloneResponseMutableHeaders(new Response());
        const context: Context = {
            request: request_to_options(request),
            connInfo,
            response,
        };
        context_to_original_Request.set(context, request);
        const next = async () => {
            context.response = await notfoundHandler(context);
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
