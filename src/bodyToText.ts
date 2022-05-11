export async function bodyToText(body?: BodyInit | null): Promise<string> {
    return await new Response(body).text();
}
