import { Context, RequestOptions } from "./Context.ts";
import { RequestOptionsPartial } from "./Middleware.ts";
import { request_to_options } from "./request_to_options.ts";

export function updateRequest(
    context: Context,
    request: Request | RequestOptionsPartial,
) {
    const {
        url = context.request.url,
        headers = context.request.headers,
        method = context.request.method,
        body = context.request.body,
    } = request;
    const options: RequestOptions = request_to_options({
        url,
        headers,
        method,
        body,
    });
    context.request = options;
}
