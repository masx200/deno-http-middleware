import { cloneResponseMutableHeaders } from "../response/cloneResponseMutableHeaders.ts";
import { Context } from "./Context.ts";
import { ResponseOptionsPartial } from "./Middleware.ts";

export function updateResponse(
    context: Context,
    response: Response | ResponseOptionsPartial,
) {
    const {
        headers = context.response.headers,
        status = context.response.status,
        body = context.response.body,
        statusText = context.response.statusText,
    } = response;
    context.response = cloneResponseMutableHeaders({
        headers: headers instanceof Headers ? headers : new Headers(headers),
        status,
        body,
        statusText,
    });
}
