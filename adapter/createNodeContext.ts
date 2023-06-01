import type { IncomingMessage, ServerResponse } from "./RequestListener.ts";

import { Context } from "../mod.ts";
import { cloneResponseMutableHeaders } from "../response/cloneResponseMutableHeaders.ts";
import { request_to_options } from "../src/request_to_options.ts";
import { context_toIncomingMessage } from "./getIncomingMessage.ts";
import { context_toServerResponse } from "./getServerResponse.ts";
import { IncomingMessageToRequest } from "./IncomingMessageToRequest.ts";

export function createNodeContext(
    request: IncomingMessage,
    serverresponse: ServerResponse,
): Context {
    const response = cloneResponseMutableHeaders(new Response());
    const context: Context = {
        request: request_to_options(IncomingMessageToRequest(request)),

        response,
    };
    context_toIncomingMessage.set(context, request);
    context_toServerResponse.set(context, serverresponse);

    return context as Context;
}
