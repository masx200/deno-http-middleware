import * as http from "node:http";
import * as http2 from "node:http2";
import * as net from "node:net";
import * as tls from "node:tls";

type ServerRequest =
    & http.IncomingMessage
    & http2.Http2ServerRequest
    & {
        socket: Socket;
    };
type ServerResponse =
    & http.ServerResponse
    & http2.Http2ServerResponse
    & {
        socket: Socket;
    };
type Socket = tls.TLSSocket & net.Socket;
type RequestListener = (req: ServerRequest, res: ServerResponse) => void;
export type {
    RequestListener,
    ServerRequest,
    ServerRequest as IncomingMessage,
    ServerResponse,
    Socket,
};
