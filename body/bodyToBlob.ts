export async function bodyToBlob(body?: BodyInit | null): Promise<Blob> {
    return await new Response(body).blob();
}
