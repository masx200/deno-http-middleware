import { bodyToBlob } from "./body/bodyToBlob.ts";
import { bodyToBuffer } from "./body/bodyToBuffer.ts";
import { bodyToFormData } from "./body/bodyToFormData.ts";
import { bodyToJSON } from "./body/bodyToJSON.ts";
import { bodyToText } from "./body/bodyToText.ts";
import { CorsOptions } from "./middleware/cors_all_get.ts";
import { compose, composeMiddleware } from "./src/composeMiddleware.ts";
import { Context } from "./src/Context.ts";
import {
    createContext,
    createHandler,
    get_original_Request,
} from "./src/createHandler.ts";
import { error_handler } from "./src/error_handler.ts";
import { ErrorHandler } from "./src/ErrorHandler.ts";
import {
    Middleware,
    NextFunction,
    RequestOptionsPartial,
    ResponseOptionsPartial,
    RetHandler,
} from "./src/Middleware.ts";
import { notfound_handler } from "./src/notfound_handler.ts";
import { NotFoundHandler } from "./src/NotFoundHandler.ts";
import { response_builder, ResponseBuilder } from "./src/response_builder.ts";
import { ret_processor, RetProcessor } from "./src/RetProcessor.ts";
import { html, json, text } from "./deps.ts";

export {
    bodyToBlob,
    bodyToBuffer,
    bodyToFormData,
    bodyToJSON,
    bodyToText,
    html,
    json,
    text,
};
export {
    compose,
    composeMiddleware,
    createContext,
    createHandler,
    error_handler,
    get_original_Request,
    get_original_Request as getOriginalRequest,
    notfound_handler,
    response_builder,
    ret_processor,
};
export type {
    Context,
    ErrorHandler,
    Middleware,
    NextFunction,
    NotFoundHandler,
    RequestOptionsPartial,
    ResponseBuilder,
    ResponseOptionsPartial,
    RetHandler,
    RetProcessor,
};
export * from "./middleware.ts";
export type { CorsOptions };
