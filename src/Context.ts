import { cloneResponseMutableHeaders } from "../response/cloneResponseMutableHeaders.ts";
import { request_to_options } from "./request_to_options.ts";

export class Context {
    #request: RequestOptions;
    public get request(): RequestOptions {
        return this.#request;
    }
    public set request(value: RequestOptions) {
        this.#request = request_to_options(value);
    }
    #response: ResponseOptions;
    public get response(): ResponseOptions {
        return this.#response;
    }
    public set response(value: ResponseOptions) {
        this.#response = cloneResponseMutableHeaders(value);
    }

    constructor(request: RequestOptions, response: ResponseOptions) {
        this.#request = request;
        this.#response = response;
    }
}

export interface ResponseOptions {
    headers: Headers;
    status: number;
    statusText: string;

    body?: any;
}
export type RequestOptions = {
    headers: Headers;
    method: string;
    url: string;
    body?: ReadableStream<Uint8Array> | null | BodyInit;
};
