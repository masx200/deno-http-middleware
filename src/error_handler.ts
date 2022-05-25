import { STATUS_TEXT } from "../deps.ts";

import { ErrorHandler } from "./ErrorHandler.ts";

// deno-lint-ignore require-await
export const error_handler: ErrorHandler = async (
    err: unknown,
): Promise<Response> => {
    console.error(String(err));
    return new Response(`${STATUS_TEXT.get(500)}` + "\n" + String(err), {
        status: 500,
    });
};
