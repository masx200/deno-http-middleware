import { Context } from "./Context.ts";
import type { IncomingMessage } from "node:http";

export const context_toIncomingMessage = new WeakMap<
    Context,
    IncomingMessage
>();
export function getIncomingMessage(ctx: Context): IncomingMessage | undefined {
    return context_toIncomingMessage.get(ctx);
}
