import { STATUS_TEXT } from "../deps.ts";

import { NotFoundHandler } from "./NotFoundHandler.ts";

export const notfound_handler: NotFoundHandler =
    // deno-lint-ignore require-await
    async (): Promise<Response> => {
        return new Response(`${STATUS_TEXT[404]}`, {
            status: 404,
        });
    };
