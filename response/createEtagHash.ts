import { encode } from "../deps.ts";

export async function createEtagHash(
    message: string | Uint8Array = "",
    options: { weak?: boolean } = {},
): Promise<string> {
    const weak = options.weak;
    const def = '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
    if (message.length === 0) return weak ? "W/" + def : def;
    const algorithm = "SHA-256";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const msgUint8 = message instanceof Uint8Array
        ? message
        : encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
    const tag = msgUint8.length.toString(16) +
        "-" +
        decoder.decode(encode(new Uint8Array(hashBuffer)));
    return weak ? "W/" + tag : tag;
}
