import { EtagResponse } from "./EtagResponse.ts";

export async function JSONResponse(
    // deno-lint-ignore no-explicit-any
    response: Partial<Response & ResponseInit & { body?: any }>,
): Promise<Response> {
    const body = JSON.stringify(response.body);
    const { headers, status, statusText } = response;

    const result = await EtagResponse({ body, headers, status, statusText });
    result.headers.set("Content-Type", "application/json");
    return result;
}
