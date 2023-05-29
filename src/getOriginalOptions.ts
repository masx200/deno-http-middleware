import { Context } from "./Context.ts";
import { context_to_original_Options } from "./createHandler.ts";

export function getOriginalOptions(ctx: Context): any | undefined {
    return context_to_original_Options.get(ctx);
}
