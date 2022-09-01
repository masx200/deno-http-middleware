import { expect } from "expect";

import { json } from "../deps.ts";
import { compose, Context, logger, Middleware } from "../mod.ts";
import { createContext, createHandler } from "../src/createHandler.ts";
// deno-lint-ignore-file require-await require-await
import { cors } from "./cors_all_get.ts";

const describe = Deno.test;
describe("default options", async function (t) {
    const it = t.step;
    const app = compose(logger, cors(), () => json({ foo: "bar" }));

    await it("should not set `Access-Control-Allow-Origin` when request Origin header missing", async () => {
        await request(app)
            .get("/")
            .expect({ foo: "bar" })
            .expect(200, function (res) {
                assert(!res.headers["access-control-allow-origin"]);
            });
    });

    await it("should set `Access-Control-Allow-Origin` to request origin header", async () => {
        await request(app)
            .get("/")
            .set("Origin", "http://koajs.com")
            .expect("Access-Control-Allow-Origin", "http://koajs.com")
            .expect({ foo: "bar" })
            .expect(200);
    });

    await it("should 204 on Preflight Request", async () => {
        await request(app)
            .options("/")
            .set("Origin", "http://koajs.com")
            .set("Access-Control-Request-Method", "PUT")
            .expect("Access-Control-Allow-Origin", "http://koajs.com")
            .expect(
                "Access-Control-Allow-Methods",
                "GET,HEAD,PUT,POST,DELETE,PATCH",
            )
            .expect(204);
    });

    await it("should not Preflight Request if request missing Access-Control-Request-Method", async () => {
        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .expect(200);
    });

    await it("should always set `Vary` to Origin", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect("Vary", "Origin")
            .expect({ foo: "bar" })
            .expect(200);
    });
});

describe("options.origin=*", async function (t) {
    const it = t.step;
    const app = compose(
        logger,
        cors({
            origin: "*",
        }),
        () => json({ foo: "bar" }),
    );

    await it("should always set `Access-Control-Allow-Origin` to *", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect("Access-Control-Allow-Origin", "*")
            .expect({ foo: "bar" })
            .expect(200);
    });
});

describe("options.secureContext=true", async function (t) {
    const it = t.step;
    const app = compose(
        logger,
        cors({
            secureContext: true,
        }),
        () => json({ foo: "bar" }),
    );

    await it("should always set `Cross-Origin-Opener-Policy` & `Cross-Origin-Embedder-Policy` on not OPTIONS", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect("Cross-Origin-Opener-Policy", "same-origin")
            .expect("Cross-Origin-Embedder-Policy", "require-corp")
            .expect({ foo: "bar" })
            .expect(200);
    });

    await it("should always set `Cross-Origin-Opener-Policy` & `Cross-Origin-Embedder-Policy` on OPTIONS", async () => {
        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .expect("Cross-Origin-Opener-Policy", "same-origin")
            .expect("Cross-Origin-Embedder-Policy", "require-corp")
            .expect(204);
    });
});

describe("options.secureContext=false", async function (t) {
    const it = t.step;
    const app = compose(
        logger,
        cors({
            secureContext: false,
        }),
        () => json({ foo: "bar" }),
    );

    await it("should not set `Cross-Origin-Opener-Policy` & `Cross-Origin-Embedder-Policy`", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect({ foo: "bar" })
            .expect(200, (res) => {
                assert(!("Cross-Origin-Opener-Policy" in res.headers));
                assert(!("Cross-Origin-Embedder-Policy" in res.headers));
            });
    });
});

describe("options.origin=function", async function (t) {
    const it = t.step;
    const app = compose(
        logger,
        async (_ctx, next) => {
            // console.log(ctx);
            await next();
            // console.log(ctx);
        },
        cors({
            origin(ctx) {
                // console.log(ctx);
                if (new URL(ctx.request.url).pathname === "/forbin") {
                    return false;
                }
                return "*";
            },
        }),
        (_ctx) => {
            // console.log(ctx);
            return json({ foo: "bar" });
        },
    );

    await it("should set access-control-allow-origin to *", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect({ foo: "bar" })
            .expect("Access-Control-Allow-Origin", "*")
            .expect(200);
    });
    await it("should disable cors", async () => {
        await request(app)
            .get("/forbin")
            .set("Origin", "https://hattipjs.org")
            .expect({ foo: "bar" })
            .expect(200, function (res) {
                // console.log(res);
                assert(!res.headers["access-control-allow-origin"]);
            });
    });
});

describe("options.origin=async function", async function (t) {
    const it = t.step;
    const app = compose(
        logger,
        cors({
            async origin(ctx) {
                if (new URL(ctx.request.url).pathname === "/forbin") {
                    return false;
                }
                return "*";
            },
        }),
        () => json({ foo: "bar" }),
    );

    await it("should disable cors", async () => {
        await request(app)
            .get("/forbin")
            .set("Origin", "https://hattipjs.org")
            .expect({ foo: "bar" })
            .expect(200, function (res) {
                assert(!res.headers["access-control-allow-origin"]);
            });
    });

    await it("should set access-control-allow-origin to *", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect({ foo: "bar" })
            .expect("Access-Control-Allow-Origin", "*")
            .expect(200);
    });
});

describe("options.exposeHeaders", async function (t) {
    const it = t.step;
    await it("should Access-Control-Expose-Headers: `content-length`", async () => {
        const app = compose(
            logger,
            cors({
                exposeHeaders: "content-length",
            }),
            () => json({ foo: "bar" }),
        );

        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect("Access-Control-Expose-Headers", "content-length")
            .expect({ foo: "bar" })
            .expect(200);
    });

    await it("should work with array", async () => {
        const app = compose(
            cors({
                exposeHeaders: ["content-length", "x-header"],
            }),
            () => json({ foo: "bar" }),
        );

        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect("Access-Control-Expose-Headers", "content-length,x-header")
            .expect({ foo: "bar" })
            .expect(200);
    });
});

describe("options.maxAge", async function (t) {
    const it = t.step;
    await it("should set maxAge with number", async () => {
        const app = compose(
            logger,
            cors({
                maxAge: 3600,
            }),
            () => json({ foo: "bar" }),
        );

        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .expect("Access-Control-Max-Age", "3600")
            .expect(204);
    });

    await it("should set maxAge with string", async () => {
        const app = compose(
            cors({
                maxAge: "3600",
            }),
            () => json({ foo: "bar" }),
        );

        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .expect("Access-Control-Max-Age", "3600")
            .expect(204);
    });

    await it("should not set maxAge on simple request", async () => {
        const app = compose(
            cors({
                maxAge: "3600",
            }),
            () => json({ foo: "bar" }),
        );

        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect({ foo: "bar" })
            .expect(200, function (res) {
                assert(!res.headers["access-control-max-age"]);
            });
    });
});

describe("options.credentials", async function (t) {
    const it = t.step;
    const app = compose(
        logger,
        cors({
            credentials: true,
        }),
        () => json({ foo: "bar" }),
    );

    await it("should enable Access-Control-Allow-Credentials on Simple request", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect("Access-Control-Allow-Credentials", "true")
            .expect({ foo: "bar" })
            .expect(200);
    });

    await it("should enable Access-Control-Allow-Credentials on Preflight request", async () => {
        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "DELETE")
            .expect("Access-Control-Allow-Credentials", "true")
            .expect(204);
    });
});

describe("options.credentials unset", async function (t) {
    const it = t.step;
    const app = compose(logger, cors(), () => json({ foo: "bar" }));

    await it("should disable Access-Control-Allow-Credentials on Simple request", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect({ foo: "bar" })
            .expect(200, function (response) {
                const header =
                    response.headers["access-control-allow-credentials"];
                expect(header).toBeUndefined();
            });
    });

    await it("should disable Access-Control-Allow-Credentials on Preflight request", async () => {
        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "DELETE")
            .expect(204, function (response) {
                const header =
                    response.headers["access-control-allow-credentials"];
                expect(header).toBeUndefined();
            });
    });
});

describe("options.credentials=function", async function (t) {
    const it = t.step;
    const app = compose(
        logger,
        cors({
            credentials(ctx) {
                return new URL(ctx.request.url).pathname !== "/forbin";
            },
        }),
        () => json({ foo: "bar" }),
    );

    await it("should enable Access-Control-Allow-Credentials on Simple request", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect("Access-Control-Allow-Credentials", "true")
            .expect({ foo: "bar" })
            .expect(200);
    });

    await it("should enable Access-Control-Allow-Credentials on Preflight request", async () => {
        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "DELETE")
            .expect("Access-Control-Allow-Credentials", "true")
            .expect(204);
    });

    await it("should disable Access-Control-Allow-Credentials on Simple request", async () => {
        await request(app)
            .get("/forbin")
            .set("Origin", "https://hattipjs.org")
            .expect({ foo: "bar" })
            .expect(200, function (response) {
                const header =
                    response.headers["access-control-allow-credentials"];
                expect(header).toBeUndefined();
            });
    });

    await it("should disable Access-Control-Allow-Credentials on Preflight request", async () => {
        await request(app)
            .options("/forbin")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "DELETE")
            .expect(204, function (response) {
                const header =
                    response.headers["access-control-allow-credentials"];
                expect(header).toBeUndefined();
            });
    });
});

describe("options.credentials=async function", async function (t) {
    const it = t.step;
    const app = compose(
        logger,
        cors({
            async credentials() {
                return true;
            },
        }),
        () => json({ foo: "bar" }),
    );

    await it("should enable Access-Control-Allow-Credentials on Simple request", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .expect("Access-Control-Allow-Credentials", "true")
            .expect({ foo: "bar" })
            .expect(200);
    });

    await it("should enable Access-Control-Allow-Credentials on Preflight request", async () => {
        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "DELETE")
            .expect("Access-Control-Allow-Credentials", "true")
            .expect(204);
    });
});

describe("options.allowHeaders", async function (t) {
    const it = t.step;
    await it("should work with allowHeaders is string", async () => {
        const app = compose(
            logger,
            cors({
                allowHeaders: "X-PINGOTHER",
            }),
            () => json({ foo: "bar" }),
        );

        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .expect("Access-Control-Allow-Headers", "X-PINGOTHER")
            .expect(204);
    });

    await it("should work with allowHeaders is array", async () => {
        const app = compose(
            cors({
                allowHeaders: ["X-PINGOTHER"],
            }),
            () => json({ foo: "bar" }),
        );

        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .expect("Access-Control-Allow-Headers", "X-PINGOTHER")
            .expect(204);
    });

    await it("should set Access-Control-Allow-Headers to request access-control-request-headers header", async () => {
        const app = compose(cors(), () => json({ foo: "bar" }));

        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .set("access-control-request-headers", "X-PINGOTHER")
            .expect("Access-Control-Allow-Headers", "X-PINGOTHER")
            .expect(204);
    });
});

describe("options.allowMethods", async function (t) {
    const it = t.step;
    await it("should work with allowMethods is array", async () => {
        const app = compose(
            logger,
            cors({
                allowMethods: ["GET", "POST"],
            }),
            () => json({ foo: "bar" }),
        );

        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .expect("Access-Control-Allow-Methods", "GET,POST")
            .expect(204);
    });

    await it("should skip allowMethods", async () => {
        const app = compose(
            cors({
                allowMethods: null,
            }),
            () => json({ foo: "bar" }),
        );

        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .expect(204);
    });
});

describe(
    "other middleware has been set `Vary` header to Accept-Encoding",
    async function (t) {
        const it = t.step;
        const app = compose(
            logger,
            async (_ctx, next) => {
                const response = await next();
                response.headers.append("Vary", "Accept-Encoding");
                return response;
            },
            cors(),
            () => json({ foo: "bar" }),
        );

        await it("should append `Vary` header to Origin", async () => {
            await request(app)
                .get("/")
                .set("Origin", "https://hattipjs.org")
                .expect("Vary", "Origin, Accept-Encoding")
                .expect({ foo: "bar" })
                .expect(200);
        });
    },
);

describe("options.privateNetworkAccess=false", async function (t) {
    const it = t.step;
    const app = compose(
        logger,
        cors({
            privateNetworkAccess: false,
        }),
        () => json({ foo: "bar" }),
    );

    await it("should not set `Access-Control-Allow-Private-Network` on not OPTIONS", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .expect(200, (res) => {
                assert(
                    !("Access-Control-Allow-Private-Network" in res.headers),
                );
            });
    });

    await it("should not set `Access-Control-Allow-Private-Network` if `Access-Control-Request-Private-Network` not exist on OPTIONS", async () => {
        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .expect(204, (res) => {
                assert(
                    !("Access-Control-Allow-Private-Network" in res.headers),
                );
            });
    });

    await it("should not set `Access-Control-Allow-Private-Network` if `Access-Control-Request-Private-Network` exist on OPTIONS", async () => {
        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .set("Access-Control-Request-Private-Network", "true")
            .expect(204, (res) => {
                assert(
                    !("Access-Control-Allow-Private-Network" in res.headers),
                );
            });
    });
});

describe("options.privateNetworkAccess=true", async function (t) {
    const it = t.step;
    const app = compose(
        logger,
        cors({
            privateNetworkAccess: true,
        }),
        () => json({ foo: "bar" }),
    );

    await it("should not set `Access-Control-Allow-Private-Network` on not OPTIONS", async () => {
        await request(app)
            .get("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .expect(200, (res) => {
                assert(
                    !("Access-Control-Allow-Private-Network" in res.headers),
                );
            });
    });

    await it("should not set `Access-Control-Allow-Private-Network` if `Access-Control-Request-Private-Network` not exist on OPTIONS", async () => {
        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .expect(204, (res) => {
                assert(
                    !("Access-Control-Allow-Private-Network" in res.headers),
                );
            });
    });

    await it("should always set `Access-Control-Allow-Private-Network` if `Access-Control-Request-Private-Network` exist on OPTIONS", async () => {
        await request(app)
            .options("/")
            .set("Origin", "https://hattipjs.org")
            .set("Access-Control-Request-Method", "PUT")
            .set("Access-Control-Request-Private-Network", "true")
            .expect("Access-Control-Allow-Private-Network", "true")
            .expect(204);
    });
});

function makeRequestContext(url: string, options?: RequestInit): Context {
    return createContext(
        new Request(new URL(url, "http://example.com"), options),
        {
            remoteAddr: { transport: "tcp", hostname: "127.0.0.1", port: 0 },
            localAddr: { transport: "tcp", hostname: "127.0.0.1", port: 0 },
            alpnProtocol: null,
        },
    );
    // return {
    //     request: ,
    //     ip: "127.0.0.1",
    //     // passThrough() {
    //     //     // No op
    //     // },
    //     // waitUntil() {
    //     //     // No op
    //     // },
    //     // platform: {},
    // };
}

function request(app: Middleware): RequestInterface {
    const result = {
        _context: null as null | Context,

        _response: null as null | Promise<Response>,

        request(method: string, url: string) {
            this._context = makeRequestContext(url, { method });
            return this;
        },

        expect(arg: any, cb?: ((res: SimpleResponse) => void) | string) {
            if (!this._response) {
                const handler_fn = createHandler(app);
                const request_obj = new Request(
                    this._context!.request.url,
                    this._context!.request,
                );
                this._response = handler_fn(request_obj, {
                    remoteAddr: {
                        transport: "tcp",
                        hostname: "127.0.0.1",
                        port: 0,
                    },
                    localAddr: {
                        transport: "tcp",
                        hostname: "127.0.0.1",
                        port: 0,
                    },
                    alpnProtocol: null,
                }) as any;
            }
            // this._response!.then(console.log);
            if (typeof arg === "object") {
                // this._response!.then(console.log);
                expect(
                    this._response!.then((r) => r.json()),
                ).resolves.toStrictEqual(arg);
            } else if (typeof arg === "number") {
                return this._response!.then((r) => {
                    expect(r.status).toBe(arg);

                    if (typeof cb === "function") {
                        cb({
                            headers: Object.fromEntries(r.headers.entries()),
                        });
                    }
                });
            } else if (typeof arg === "string") {
                expect(
                    this._response!.then((r) => r.headers.get(arg)),
                ).resolves.toBe(cb);
            }

            return this;
        },

        set(key: string, value: string) {
            this._context!.request.headers.set(key, value);
            return this;
        },

        get(url: string) {
            return this.request("GET", url);
        },

        options(url: string) {
            return this.request("OPTIONS", url);
        },
    };

    return result as RequestInterface;
}

interface SimpleResponse {
    headers: Record<string, string>;
}

// deno-lint-ignore no-explicit-any
function assert(arg: any) {
    expect(arg).toBeTruthy();
}

interface RequestInterface {
    set(key: string, value: string): RequestInterface;
    get(url: string): RequestInterface;
    options(url: string): RequestInterface;
    expect(body: Record<string, string>): RequestInterface;
    expect(header: string, value: string): RequestInterface;
    expect(status: number, cb?: (res: SimpleResponse) => void): Promise<void>;
}
