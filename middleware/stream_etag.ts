import { Middleware } from "../src/Middleware.ts";
import { createEtagHash as calculate } from "../response/createEtagHash.ts";
import { Context } from "../src/Context.ts";

import { bodyToBuffer } from "../body/bodyToBuffer.ts";
import {
    copyN,
    readerFromStreamReader,
    writerFromStreamWriter,
} from "../deps.ts";

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
    // deno-lint-ignore no-unused-vars
    sizelimit: number,
): Promise<string | undefined | Uint8Array> {
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

    if (!body || ctx.response.headers.get("etag")) {
        return;
    }
    const status = (ctx.response.status / 100) | 0;
    if (status !== 2) {
        return;
    }
    if (body instanceof ReadableStream) {
        try {
            const stream = new TransformStream();
            const reader = readerFromStreamReader(body.getReader());
            const streamdefaultwriter = stream.writable.getWriter();
            const writer = writerFromStreamWriter(streamdefaultwriter);
            await copyN(reader, writer, sizelimit);
            await streamdefaultwriter.close();
            await stream.writable.close();
            const buffer = await bodyToBuffer(stream.readable);
            return buffer;
        } catch (_error) {
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
