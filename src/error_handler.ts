import { STATUS_TEXT } from "../deps.ts";
import { ErrorHandler } from "./ErrorHandler.ts";

// deno-lint-ignore require-await
export const error_handler: ErrorHandler = async (
    err: unknown,
): Promise<Response> => {
    // deno-lint-ignore no-explicit-any
    // console.error(String(err), (err as any)?.stack);
    return new Response(`${STATUS_TEXT[500]}` + "\n" + String(err), {
        status: 500,
    });
};
