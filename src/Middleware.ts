import { Context, ResponseOptions } from "./Context.ts";

// deno-lint-ignore no-explicit-any
export type Middleware<T = Record<any, any>> = (
    context: Context<T>,
    next: NextFunction,
) => Promise<RetHandler> | RetHandler;
export type NextFunction = () => Promise<ResponseOptions> | ResponseOptions;

export type RetHandler =
    | void
    | Response
    | Request
    | Partial<
        ResponseOptionsPartial & {
            response: Response | ResponseOptionsPartial;
            request: Request | RequestOptionsPartial;
            next: boolean;
        }
    >;

export type ResponseOptionsPartial = Partial<
    ResponseInit & {
        // deno-lint-ignore no-explicit-any
        body?: any;
    }
>;
export type RequestOptionsPartial = Partial<
    Pick<RequestInit, "headers" | "method"> & {
        url: string;

        body?: ReadableStream<Uint8Array> | null;
    }
>;
