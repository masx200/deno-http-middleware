export async function bodyToText(
body?: BodyInit | null,
headers?: HeadersInit,
): Promise<string> {
    return await new Response(body,{headers}).text();
}
