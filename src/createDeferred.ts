export function createDeferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    // deno-lint-ignore no-explicit-any
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}
