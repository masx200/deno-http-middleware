import { assertEquals } from "../deps.ts";
import { request_to_options } from "../src/request_to_options.ts";

Deno.test("request_to_options", () => {
    const options = request_to_options({
        method: "CONNECT",
        url: "http://localhost:8080/",
        body: null,
        headers: { "content-type": "application/json" },
    });
    assertEquals(options.method, "CONNECT");
    assertEquals(options.url, "http://localhost:8080/");
    assertEquals(options.body, null);
    assertEquals(options.headers.get("content-type"), "application/json");
});
