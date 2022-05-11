export async function bodyToFormData(
    body?: BodyInit | null,
    headers?: HeadersInit,
): Promise<FormData> {
    return await new Response(body, { headers }).formData();
}
