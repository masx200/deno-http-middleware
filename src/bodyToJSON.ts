export async function bodyToJSON(
    body?: BodyInit | null,
    // deno-lint-ignore no-explicit-any
): Promise<any> {
    return await new Response(body).json();
}
