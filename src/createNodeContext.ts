import { cloneResponseMutableHeaders } from "../response/cloneResponseMutableHeaders.ts";
import { Context } from "./Context.ts";
import { context_toIncomingMessage } from "./getIncomingMessage.ts";
import { IncomingMessageToRequest } from "./IncomingMessageToRequest.ts";
import { request_to_options } from "./request_to_options.ts";

import type { IncomingMessage } from "./RequestListener.ts";
export function createNodeContext(
    request: IncomingMessage,
): Context {
    const response = cloneResponseMutableHeaders(new Response());
    const context: Context = {
        request: request_to_options(IncomingMessageToRequest(request)),
        // arguments: { request, options: options },
        response,
    };
    context_toIncomingMessage.set(context, request);

    return context as Context;
}
