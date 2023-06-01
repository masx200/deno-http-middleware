import {
    composeMiddleware,
    createNodeContext,
    error_handler,
    ErrorHandler,
    Middleware,
    notfound_handler,
    NotFoundHandler,
    response_builder,
    ResponseBuilder,
    ret_processor,
    RetHandler,
    RetProcessor,
} from "../mod.ts";
import {
    IncomingMessage,
    RequestListener,
    ServerResponse,
} from "./RequestListener.ts";
import { ResponseToServerResponse } from "./ResponseToServerResponse.ts";

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
        const context = createNodeContext(request, response);
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
