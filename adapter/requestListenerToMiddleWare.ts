import { Middleware, NextFunction, RetHandler } from "../src/Middleware.ts";

import { Context } from "../mod.ts";
import { RequestListener } from "./RequestListener.ts";
import { createServer } from "node:http";

export function requestListenerToMiddleWare(
    requestListener: RequestListener
): [Middleware, () => Promise<void>, () => void] {
    //@ts-ignore
    const server = createServer(requestListener);
    const host = `127.${Math.floor(Math.random() * 253 + 1)}.${Math.floor(
        Math.random() * 253 + 1
    )}.${Math.floor(Math.random() * 253 + 1)}`;
    const port = Math.floor(Math.random() * 55535 + 10000);
    return [
        async (context: Context, next: NextFunction): Promise<RetHandler> => {
            //@ts-ignore

            const origin = `http://${host}:${port}`;

            const urlobj = new URL(context.request.url);
            urlobj.origin;
            const response = await fetch(
                origin + urlobj.href.slice(urlobj.origin.length),
                {
                    ...context.request,
                    //@ts-ignore

                    duplex: "half",
                }
            );
            if (response.status === 404) return next();

            return response;
        },
        async () =>
            new Promise((s) => {
                server.listen(port, host, () => {
                    console.log(
                        `http server listening host:${host} port:` + port
                    );

                    s();
                });
            }),
        () =>
            server.close(() => {
                console.log(`http server closed host:${host} port:` + port);
            }),
    ];
}
