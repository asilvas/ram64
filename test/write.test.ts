import { startup, RAM64, CacheObject, RAMFunction } from '../src';

let instance: RAM64;

beforeAll(async () => {
    instance = await startup({ threadCount: 2 });
});

afterAll(async () => {
    await instance.shutdown();
});

describe('touch', () => {
    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.set(key, expectedValue);
        const value = await instance.touch(key);
        expect(value?.value).toBe(expectedValue);
    });
});

describe('set', () => {
    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.set(key, expectedValue);
        const value = await instance.get(key);
        expect(value).toBe(expectedValue);
    });
});

describe('setIfValue', () => {
    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.set(key, expectedValue);
        const nextValue = Math.random();
        const result = await instance.setIfValue(key, expectedValue, nextValue);
        expect(result).toBe(true);
        const value = await instance.get(key);
        expect(value).toBe(nextValue);
    });

    it('unexpected value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.set(key, expectedValue);
        const nextValue = Math.random();
        const result = await instance.setIfValue(key, 234234, nextValue);
        expect(result).toBe(false);
        const value = await instance.get(key);
        expect(value).toBe(expectedValue);
    });
});

describe('setWithOptions', () => {
    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue: CacheObject = { value: Math.random() };
        await instance.setWithOptions(key, expectedValue);
        const value = await instance.getWithOptions(key);
        expect(value).toEqual(expectedValue);
    });

    it('non-expired value', async () => {
        const key = Math.random().toString();
        const expectedValue: CacheObject = { value: Math.random(), expAt: Date.now() + 10000 };
        await instance.setWithOptions(key, expectedValue);
        const value = await instance.getWithOptions(key);
        expect(value).toEqual(expectedValue);
    });

    it('expired value', async () => {
        const key = Math.random().toString();
        const expectedValue: CacheObject = { value: Math.random(), expAt: Date.now() - 10000 };
        await instance.setWithOptions(key, expectedValue);
        const value = await instance.getWithOptions(key);
        expect(value).toEqual(undefined);
    });
});

describe('setOptions', () => {
    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue: CacheObject = { value: Math.random() };
        await instance.setWithOptions(key, expectedValue);
        const newOptions = { expAt: Date.now() + 10000 };
        const ret = await instance.setOptions(key, newOptions);
        expect(ret).toEqual(true);
        const obj = await instance.getWithOptions(key) as CacheObject;
        expect(obj.expAt).toEqual(newOptions.expAt);
    });

    it('options not set', async () => {
        const key = Math.random().toString();
        const ret = await instance.setOptions(key, {});
        expect(ret).toEqual(false);
    });
});

describe('insert', () => {
    it('success', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        const ret = await instance.insert(key, expectedValue);
        expect(ret).toBe(true);
        const value = await instance.get(key);
        expect(value).toBe(expectedValue);
    });

    it('failure', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.set(key, expectedValue);
        const ret = await instance.insert(key, Math.random());
        expect(ret).toBe(false);
        const value = await instance.get(key);
        expect(value).toBe(expectedValue);
    });
});

describe('setFn', () => {
    it('value function', async () => {
        const fn = RAMFunction.fromString('return (cacheObject?.value ?? 0) + params');
        await instance.registerFunction(fn);
        const key = Math.random().toString();
        const firstValue = Math.random();
        await instance.set(key, firstValue);
        const secondValue = Math.random();
        const result = await instance.setFn(key, fn, secondValue);
        const expectedValue = firstValue + secondValue;
        expect(result?.value).toBe(expectedValue);
    });

    it('object function', async () => {
        const fn = RAMFunction.fromString('return { value: (cacheObject?.value ?? 0) + params }');
        await instance.registerFunction(fn);
        const key = Math.random().toString();
        const firstValue = Math.random();
        await instance.set(key, firstValue);
        const secondValue = Math.random();
        const result = await instance.setFn(key, fn, secondValue);
        const expectedValue = firstValue + secondValue;
        expect(result?.value).toBe(expectedValue);
    });
});

describe('getAndSet', () => {
    it('undefined', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        const ret = await instance.getAndSet(key, () => Promise.resolve({ value: expectedValue }));
        expect(ret?.value).toBe(undefined);
        const value = await instance.get(key);
        expect(value).toBe(expectedValue);
    });

    it('set without staleness', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.set(key, expectedValue);
        const ret = await instance.getAndSet(key, () => Promise.resolve({ value: Math.random() }));
        expect(ret?.value).toBe(expectedValue);
        const value = await instance.get(key);
        expect(value).toBe(expectedValue); // unchanged
    });

    it('set with staleness', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.setWithOptions(key, { value: expectedValue, staleAt: Date.now() - 10000 }); // stale
        const newValue = Math.random();
        const ret = await instance.getAndSet(key, () => Promise.resolve({ value: newValue }));
        expect(ret?.value).toBe(expectedValue); // old val
        const value = await instance.get(key);
        expect(value).toBe(newValue); // updated
    });
});

describe('setMany', () => {
    it('undefined', async () => {
        const key1 = Math.random().toString();
        const val1 = Math.random();
        const key2 = Math.random().toString();
        const val2 = Math.random();
        await instance.setMany([[key1, val1], [key2, val2]]);
        const [v1, v2] = await instance.getMany([key1, key2]);
        expect(v1).toBe(val1);
        expect(v2).toBe(val2);
    });
});
