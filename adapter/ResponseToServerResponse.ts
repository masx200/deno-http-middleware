import type { ServerResponse } from "node:http";
import { createDeferred } from "../src/createDeferred.ts";

/* https://deno.land/x/oak@v12.5.0/http_server_node.ts?source#L148 */
export async function ResponseToServerResponse(
    response: Response,
    serverResponse: ServerResponse,
): Promise<void> {
    for (const [key, value] of response.headers) {
        serverResponse.setHeader(key, value);
    }
    serverResponse.writeHead(response.status, response.statusText);

    if (response.body) {
        //https://nodejs.org/dist/latest-v18.x/docs/api/webstreams.html#async-iteration
        //@ts-ignore
        for await (const chunk of response.body) {
            const { promise, resolve, reject } = createDeferred<void>();
            // deno-lint-ignore no-explicit-any
            serverResponse.write(chunk, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
            await promise;
        }
    }
    const { promise, resolve } = createDeferred<void>();
    serverResponse.end(resolve);
    await promise;
}
