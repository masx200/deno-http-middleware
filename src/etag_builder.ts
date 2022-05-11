import { EtagResponse } from "./EtagResponse.ts";

import { Middleware, RetHandler } from "./Middleware.ts";

export const etag_builder: Middleware = async function (
    context,
    next,
): Promise<RetHandler> {
    const { response } = context;
    const { body } = response;
    const { headers, status, statusText } = response;
    return response instanceof Response
        ? response
        : body instanceof ReadableStream
        ? await next()
        : await EtagResponse({
            body: body as Exclude<BodyInit | null, ReadableStream>,
            headers,
            status,
            statusText,
        });
};
