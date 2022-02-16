import { startup, RAM64, RAMFunction, ScanResult } from '../src';

let instance: RAM64;
const evensOnlyFn = RAMFunction.fromString(`
    return Number(params?.key || 0) % 2 === 0;
`)

const KEYS = 10000;

beforeAll(async () => {
    instance = await startup({ threadCount: 2 });
    await instance.registerFunction(evensOnlyFn);

    for (let i = 0; i < KEYS; i++) {
        await instance.set(i.toString(), Math.random());
    }
});

afterAll(async () => {
    await instance.shutdown();
});

describe('scan', () => {
    it('respect limit option', async () => {
        let result = await instance.scan({ limit: 10 });
        expect(typeof result.resumeKey).toBe('string');
        expect(result.keys.length).toBe(10);
    });

    it('one scan required for each worker thread', async () => {
        let result = await instance.scan({ limit: 10000 });
        expect(typeof result.resumeKey).toBe('string');
        let keys = result.keys.length;
        result = await instance.scan({ limit: 10000, resumeKey: result.resumeKey });
        expect(result.resumeKey).toBe(undefined);
        keys += result.keys.length;
        expect(keys).toBe(KEYS);
    });

    it('one scan to pull all keys with resumeCb option', async () => {
        const result = await instance.scan({ resumeCb: (lastResult: ScanResult) => Promise.resolve(true) });
        expect(result.resumeKey).toBe(undefined);
        expect(result.keys.length).toBe(KEYS);
    });

    it('filter via regexp', async () => {
        const result = await instance.scan({
            filter: /0$/,
            resumeCb: (lastResult: ScanResult) => Promise.resolve(true)
        });
        expect(result.resumeKey).toBe(undefined);
        expect(result.keys.length).toBe(KEYS / 10);
    });

    it('filter via RAMFunction', async () => {
        const result = await instance.scan({
            filter: evensOnlyFn,
            resumeCb: (lastResult: ScanResult) => Promise.resolve(true)
        });
        expect(result.resumeKey).toBe(undefined);
        expect(result.keys.length).toBe(KEYS / 2);
    });

});
