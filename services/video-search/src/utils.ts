export async function wait(ms: number) {
    return await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mapAsyncInOrder<T, U>(
    array: T[],
    callback: (item: T) => Promise<U>,
): Promise<U[]> {
    const results: any[] = [];

    for (const item of array) {
        results.push(await callback(item));
    }

    return results;
}
