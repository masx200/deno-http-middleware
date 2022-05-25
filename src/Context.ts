import { ConnInfo } from "../deps.ts";

export type Context = {
    connInfo: ConnInfo;
    request: Request;
    response: ResponseOptions;
};

export interface ResponseOptions {
    headers: Headers;
    status: number;
    statusText: string;
    // deno-lint-ignore no-explicit-any
    body?: any;
}
