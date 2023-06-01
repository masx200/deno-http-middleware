import { Middleware, NextFunction, RetHandler } from "../src/Middleware.ts";

import { Context } from "../mod.ts";
import { MockServerRequest } from "./MockServerRequest.ts";
import { MockServerResponse } from "./MockServerResponse.ts";
import { RequestListener } from "./RequestListener.ts";
import { Socket } from "node:net";

export function requestListenerToMiddleWare(
    requestListener: RequestListener,
): Middleware {
    return async (
        context: Context,
        next: NextFunction,
    ): Promise<RetHandler> => {
        const req = new MockServerRequest(
            new Socket(),
            new Request(context.request.url, {
                ...context.request,

                //@ts-ignore

                duplex: "half",
            }),
        );

        const res = new MockServerResponse(req);
        //@ts-ignore
        requestListener(req, res);
        await new Promise((s, j) => {
            res.on("error", j);
            res.on("finish", s);
        });
        const response = res.toResponse();

        if (response.status === 404) return next();

        return response;
    };
}
