import { Middleware } from "./Middleware.ts";
import type { RequestListener } from "./RequestListener.ts";
import { createRequestListener } from "./createRequestListener";

export function listener(
    ...middleware: Array<Middleware> | Array<Middleware>[]
): RequestListener {
    return createRequestListener(middleware.flat());
}
