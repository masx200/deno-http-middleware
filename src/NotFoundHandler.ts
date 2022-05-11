import { Context } from "./Context.ts";

export type NotFoundHandler = (
    context: Context,
) => Promise<Response> | Response;
