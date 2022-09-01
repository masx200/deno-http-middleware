import { createEtagHash as calculate } from "../response/createEtagHash.ts";
import { Context } from "../src/Context.ts";
import { Middleware } from "../src/Middleware.ts";
import {
    ReadableStreamSmallerThanLimitToBuffer,
} from "../utils/ReadableStreamSmallerThanLimitToBuffer.ts";

export function stream_etag(options?: {
    sizelimit?: number | undefined;
    weak?: boolean | undefined;
}): Middleware {
    return async function etag(ctx, next) {
        await next();
        const entity = await getResponseEntity(
            ctx,
            (options && options.sizelimit) || sizelimit,
        );
        await setEtag(ctx, entity, options);
    };
}
async function getResponseEntity(
    ctx: Context,
    sizelimit: number,
): Promise<string | undefined | Uint8Array> {
    const length = ctx.response.headers.get("content-length");
    if (length && Number(length) > sizelimit) {
        return;
    }
    if (ctx.response.headers.get("etag")) {
        return;
    }
    if (!ctx.response.body) {
        return;
    }
    if (!(ctx.response.body instanceof ReadableStream)) {
        return;
    }
    let body: ReadableStream;
    if (ctx.response instanceof Response) {
        const body3 = ctx.response.clone().body;
        if (body3) {
            body = body3;
        } else {
            return;
        }
    } else {
        const [body1, body2] = ctx.response.body.tee();
        ctx.response.body = body1;
        body = body2;
    }

    if (!body) {
        return;
    }
    const status = (ctx.response.status / 100) | 0;
    if (status !== 2) {
        return;
    }
    if (body instanceof ReadableStream) {
        try {
            return await ReadableStreamSmallerThanLimitToBuffer(
                body,
                sizelimit,
            );
        } catch {
            return;
        }
    }
}
const sizelimit = 1000 * 1024;
async function setEtag(
    ctx: Context,
    entity: string | Uint8Array | undefined,
    options: { weak?: boolean | undefined } | undefined,
) {
    if (!entity) {
        return;
    }
    ctx.response.headers.set("etag", await calculate(entity, options));
}
