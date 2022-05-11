import { Context } from "./Context.ts";
export type Middleware = (
    context: Context,
    next: NextFunction,
) => Promise<RetHandler> | RetHandler;
export type NextFunction = () => Promise<void> | void;

export type RetHandler =
    | void
    | Response
    | Request
    | Partial<
        ResponseOptionsPartial & {
            response: Response | ResponseOptionsPartial;
            request: Request | RequestOptionsPartial;
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
