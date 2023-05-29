import { cloneResponseMutableHeaders } from "../response/cloneResponseMutableHeaders.ts";
import { Context } from "./Context.ts";
import {
    context_to_original_Options,
    context_to_original_Request,
} from "./createHandler.ts";
import { request_to_options } from "./request_to_options.ts";

export function createContext<T = {}>(
    request: Request,
    options: T = {} as T,
): Context<T> {
    const response = cloneResponseMutableHeaders(new Response());
    const context: Context<T> = {
        request: request_to_options(request),
        // arguments: { request, options: options },
        response,
        ...options,
    };
    context_to_original_Request.set(context, request);
    context_to_original_Options.set(context, options);
    return context as Context<T>;
}
