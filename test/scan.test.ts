import { startup, RAM64, RAMFunction, ScanResult } from '../src';

let instance: RAM64;
const evensOnlyFn = RAMFunction.fromString(`
    return Number(params?.key || 0) % 2 === 0;
`)

const KEYS = 10000;
function resumeCb(lastResult: ScanResult): Promise<boolean> {
    return Promise.resolve(true);
}

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
        let result = await instance.scan({ limit: KEYS });
        expect(typeof result.resumeKey).toBe('string');
        let keys = result.keys.length;
        result = await instance.scan({ limit: KEYS, resumeKey: result.resumeKey });
        expect(result.resumeKey).toBe(undefined);
        keys += result.keys.length;
        expect(keys).toBe(KEYS);
    });

    it('one scan to pull all keys with resumeCb option', async () => {
        const result = await instance.scan({ resumeCb });
        expect(result.resumeKey).toBe(undefined);
        expect(result.keys.length).toBe(KEYS);
    });

    it('filter via regexp', async () => {
        const result = await instance.scan({
            filter: /0$/,
            resumeCb
        });
        expect(result.resumeKey).toBe(undefined);
        expect(result.keys.length).toBe(KEYS / 10);
    });

    it('filter via RAMFunction', async () => {
        const result = await instance.scan({
            filter: evensOnlyFn,
            resumeCb
        });
        expect(result.resumeKey).toBe(undefined);
        expect(result.keys.length).toBe(KEYS / 2);
    });

});

describe('scanSplit', () => {
    it('cannot return fewer than 1 resumeKeys', () => {
        const resumeKeys = instance.scanSplit(0);
        expect(resumeKeys.length).toBe(1);
    });

    it('cannot return more than (shardCount / workerPorts) resumeKeys', () => {
        const resumeKeys = instance.scanSplit(Infinity);
        expect(resumeKeys.length).toBe(instance.shardCount / instance.workerPorts.length);
    });

    it('returns desired resumeKeys if falls within range', () => {
        const resumeKeys = instance.scanSplit(10);
        expect(resumeKeys.length).toBe(10);
    });

    it('returns desired resumeKeys if falls within range even if uneven', () => {
        const resumeKeys = instance.scanSplit(11);
        expect(resumeKeys.length).toBe(11);
    });

    it('uneven resumeKeys pulls all shards from each available worker', () => {
        const resumeKeys = instance.scanSplit(3);
        expect(resumeKeys.length).toBe(3);
        expect(resumeKeys).toEqual([
            '0:0::33334',
            '0:33335::66669',
            '1:16670::100000',
        ]);
    });

    it('scans return exactly the number of keys that exist', async () => {
        const resumeKeys = instance.scanSplit(2);
        const results = await Promise.all(resumeKeys.map(resumeKey => instance.scan({ resumeKey, resumeCb })));
        const keys = results.reduce((acc, result) => acc + result.keys.length, 0);
        expect(keys).toBe(KEYS);
    });
});
