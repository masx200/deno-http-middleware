import { Context } from "./Context.ts";

export interface NotFoundHandler {
    (context: Context): Promise<Response> | Response;
}
