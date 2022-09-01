import { ResponseOptions } from "./Context.ts";

export type ResponseBuilder = (
    response: ResponseOptions,
) => Promise<Response> | Response;
// deno-lint-ignore require-await
export const response_builder: ResponseBuilder = async function (
    response: ResponseOptions,
): Promise<Response> {
    const { body } = response;

    return response instanceof Response
        ? response
        : new Response(body, response);
};
