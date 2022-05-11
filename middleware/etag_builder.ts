import { EtagResponse } from "../respose/EtagResponse.ts";
import { Middleware, RetHandler } from "../src/Middleware.ts";

export const etag_builder: Middleware = async function (
    context,
    next,
): Promise<RetHandler> {
    await next();
    const { response } = context;
    const { body } = response;
    const { headers, status, statusText } = response;
    return response instanceof Response
        ? response
        : body instanceof ReadableStream
        ? void 0
        : await EtagResponse({
            body: body as Exclude<BodyInit | null, ReadableStream>,
            headers,
            status,
            statusText,
        });
};
