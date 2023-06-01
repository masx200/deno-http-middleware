import { IncomingMessage } from "node:http";
import { ServerResponse } from "node:http";

export class MockServerResponse extends ServerResponse {
    constructor(req: IncomingMessage) {
        super(req);
    }
    #response = new Response();
    toResponse(): Response {
        return this.#response;
    }
}
