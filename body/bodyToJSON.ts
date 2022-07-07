// deno-lint-ignore no-explicit-any
export async function bodyToJSON<T=any>(
    body?: BodyInit | null,
headers?: HeadersInit,
    
): Promise<T> {
    return await new Response(body,{headers}).json();
}
