import { Middleware } from "../mod.ts";
import { createRequestListener } from "./createRequestListener.ts";

import type { RequestListener } from "./RequestListener.ts";
export function listener(
    ...middleware: Array<Middleware> | Array<Middleware>[]
): RequestListener {
    return createRequestListener(middleware.flat());
}
