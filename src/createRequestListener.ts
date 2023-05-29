import { Middleware, RetHandler } from "./Middleware.ts";
import type { RequestListener, ServerResponse } from "node:http";
import { response_builder, ResponseBuilder } from "./response_builder.ts";
import { ret_processor, RetProcessor } from "./RetProcessor.ts";

import { ErrorHandler } from "./ErrorHandler.ts";
import type { IncomingMessage } from "node:http";
import { NotFoundHandler } from "./NotFoundHandler.ts";
import { ResponseToServerResponse } from "./ResponseToServerResponse.ts";
import { composeMiddleware } from "./composeMiddleware.ts";
import { createNodeContext } from "./createNodeContext.ts";
import { error_handler } from "./error_handler.ts";
import { notfound_handler } from "./notfound_handler.ts";

export function listener(
    ...middleware: Array<Middleware> | Array<Middleware>[]
): RequestListener {
    return createRequestListener(middleware.flat());
}
export type { RequestListener };
export function createRequestListener(
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
): RequestListener {
    const composed = composeMiddleware(
        typeof middleware === "function" ? [middleware] : middleware,
        retProcessor,
    );
    return async function (
        request: IncomingMessage,
        response: ServerResponse,
    ): Promise<void> {
        const context = createNodeContext(request);
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
            return ResponseToServerResponse(context.response, response);
        } else {
            return ResponseToServerResponse(
                await responseBuilder(context.response),
                response,
            );
        }
    };
}
