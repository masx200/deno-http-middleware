// deno-lint-ignore no-explicit-any
export type Context = {
    request: RequestOptions;
    response: ResponseOptions;
    // arguments: { request: Request; options: T };
};

export interface ResponseOptions {
    headers: Headers;
    status: number;
    statusText: string;
    // deno-lint-ignore no-explicit-any
    body?: any;
}
export type RequestOptions = {
    headers: Headers;
    method: string;
    url: string;
    body?: ReadableStream<Uint8Array> | null;
};
