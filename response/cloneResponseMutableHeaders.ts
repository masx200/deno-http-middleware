import { ResponseOptions } from "../src/Context.ts";
import { ResponseOptionsPartial } from "../src/Middleware.ts";

/* 解决headers不可变的问题 */
export function cloneResponseMutableHeaders(
    response: Response | ResponseOptionsPartial,
): ResponseOptions {
    let {
        body,
        headers = new Headers(),
        status = 200,
        statusText = "OK",
    } = response;

    headers = new Headers(headers);

    return { body, headers, status, statusText };
}
