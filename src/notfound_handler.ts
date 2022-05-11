import { STATUS_TEXT } from "../deps.ts";

import { NotFoundHandler } from "./NotFoundHandler.ts";

// deno-lint-ignore require-await
export const notfound_handler: NotFoundHandler = async (): Promise<
    Response
> => {
    return new Response(`${STATUS_TEXT.get(404)}`, {
        status: 404,
    });
};
