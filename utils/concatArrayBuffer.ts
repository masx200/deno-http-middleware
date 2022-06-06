import { bodyToBuffer } from "../body/bodyToBuffer.ts";

export async function concatArrayBuffer(
    array: Uint8Array[],
): Promise<Uint8Array> {
    return await bodyToBuffer(new Blob(array));
}
