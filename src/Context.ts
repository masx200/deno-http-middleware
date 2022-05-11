import { ConnInfo } from "../deps.ts";

export type Context = {
    connInfo: ConnInfo;
    request: RequestOptions | Request;
    response: ResponseOptions | Response;
};
export interface RequestOptions {
    headers: Headers;
    method: string;
    url: string;
    body?: ReadableStream<Uint8Array> | null;
}
export interface ResponseOptions {
    headers: Headers;
    status: number;
    statusText: string;
    // deno-lint-ignore no-explicit-any
    body?: any;
}
