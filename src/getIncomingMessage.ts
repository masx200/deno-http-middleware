import { Context } from "./Context.ts";
import { IncomingMessage } from "./RequestListener.ts";

export const context_toIncomingMessage = new WeakMap<
    Context,
    IncomingMessage
>();
export function getIncomingMessage(ctx: Context): IncomingMessage | undefined {
    return context_toIncomingMessage.get(ctx);
}
