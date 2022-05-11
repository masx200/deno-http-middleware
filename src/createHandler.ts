import { ConnInfo, Handler } from "../deps.ts";
import { composeMiddleware } from "./composeMiddleware.ts";
import { Context } from "./Context.ts";

import { ErrorHandler } from "./ErrorHandler.ts";
import { error_handler } from "./error_handler.ts";

import { Middleware, RetHandler } from "./Middleware.ts";
import { NotFoundHandler } from "./NotFoundHandler.ts";
import { notfound_handler } from "./notfound_handler.ts";
import { response_builder, ResponseBuilder } from "./response_builder.ts";
import { ret_processor, RetProcessor } from "./RetProcessor.ts";

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
        const response = new Response();
        const context: Context = { request, connInfo, response };

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
