export function headhandler() {
    return async (ctx, next) => {
        await next();
        if (ctx.method === "HEAD") {
            ctx.res.end();
        }
        return;
    };
}
//# sourceMappingURL=headhandler.js.map
