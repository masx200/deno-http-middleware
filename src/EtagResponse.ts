import { bodyToBuffer } from "./bodyToBuffer.ts";
import { createEtagHash } from "./createEtagHash.ts";

export async function EtagResponse(
    response:
        | Response
        | Partial<
            & Omit<Response, "body">
            & ResponseInit
            & {
                body?: Exclude<BodyInit | null, ReadableStream>;
            }
        >,
): Promise<Response> {
    if (response instanceof Response) {
        return response;
    }
    const { body } = response;
    const headers = new Headers(response.headers);
    const status = response.status || 200;
    if (
        body instanceof ReadableStream ||
        headers.get("etag") ||
        ((status / 100) | 0) !== 2
    ) {
        return new Response(body, response);
    } else {
        const buffer = await bodyToBuffer(body);
        const etag = await createEtagHash(buffer);

        const result = new Response(body, response);
        result.headers.set("ETag", etag);
        return result;
    }
}
