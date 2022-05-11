export async function bodyToBuffer(
    body?: BodyInit | null,
): Promise<Uint8Array> {
    return new Uint8Array(await new Response(body).arrayBuffer());
}
