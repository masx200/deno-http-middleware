import type { IncomingMessage } from "node:http";

export function IncomingMessageToRequest(
    request: IncomingMessage,
): Request {}
