import { Context } from "./Context";
import { ServerResponse } from "./RequestListener";

export const context_toServerResponse = new WeakMap<
    Context,
    ServerResponse
>();
export function getServerResponse(ctx: Context): ServerResponse | undefined {
    return context_toServerResponse.get(ctx);
}
