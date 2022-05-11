import { assert, assertEquals, assertNotEquals } from "../deps.ts";
import { createEtagHash } from "../response/createEtagHash.ts";

Deno.test("etag-hash", async () => {
    assertEquals(await createEtagHash(), await createEtagHash());
    assertEquals(
        await createEtagHash(new TextEncoder().encode("123456")),
        await createEtagHash("123456"),
    );

    assertNotEquals(await createEtagHash(), await createEtagHash("hello"));
    assertNotEquals(
        await createEtagHash("world"),
        await createEtagHash("hello"),
    );
    assert(typeof (await createEtagHash("hello")) === "string");
    assert((await createEtagHash("hello")).length > 0);
});
