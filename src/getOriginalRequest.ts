import { Context } from "./Context.ts";
import { context_to_original_Request } from "./createHandler.ts";

export function getOriginalRequest(ctx: Context): Request | undefined {
    return context_to_original_Request.get(ctx);
}
