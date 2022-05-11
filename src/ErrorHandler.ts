import { Context } from "./Context.ts";

export interface ErrorHandler {
    (error: unknown, context: Context): Promise<Response> | Response;
}
