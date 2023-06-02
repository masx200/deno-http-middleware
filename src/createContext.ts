import {
    context_to_original_Options,
    context_to_original_Request,
} from "./createHandler.ts";

import { Context } from "./Context.ts";
import { cloneResponseMutableHeaders } from "../response/cloneResponseMutableHeaders.ts";
import { request_to_options } from "./request_to_options.ts";

export function createContext(
    request: Request,
    options: any = {},
): Context {
    const response = cloneResponseMutableHeaders(new Response());
    const context: Context = new Context(
        request_to_options(request),
        response,
    );
    context_to_original_Request.set(context, request);
    context_to_original_Options.set(context, options);
    return context as Context;
}
