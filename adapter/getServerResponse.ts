import { Context } from "../mod.ts";
import { ServerResponse } from "./RequestListener.ts";

export const context_toServerResponse = new WeakMap<
    Context,
    ServerResponse
>();
export function getServerResponse(ctx: Context): ServerResponse | undefined {
    return context_toServerResponse.get(ctx);
}
