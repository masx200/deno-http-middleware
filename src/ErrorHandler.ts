import { Context } from "./Context.ts";

export type ErrorHandler = (
    error: unknown,
    context: Context,
) => Promise<Response> | Response;
