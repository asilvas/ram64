import { startup, RAM64 } from '../src';

let instance: RAM64;

beforeAll(async () => {
    instance = await startup({ threadCount: 2 });
});

afterAll(async () => {
    await instance.shutdown();
});

describe('exists', () => {
    it('undefined value', async () => {
        const value = await instance.exists('gg');
        expect(value).toBe(false);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        await instance.set(key, Math.random());
        const value = await instance.exists(key);
        expect(value).toBe(true);
    });
});

describe('get', () => {
    it('undefined value', async () => {
        const value = await instance.get('gg');
        expect(value).toBe(undefined);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.set(key, expectedValue);
        const value = await instance.get(key);
        expect(value).toBe(expectedValue);
    });
});


describe('getMany', () => {
    it('undefined', async () => {
        const key1 = Math.random().toString();
        const key2 = Math.random().toString();
        const [v1, v2] = await instance.getMany([key1, key2]);
        expect(v1).toBe(undefined);
        expect(v2).toBe(undefined);
    });

    it('defined', async () => {
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

describe('getWithOptions', () => {
    it('undefined value', async () => {
        const value = await instance.getWithOptions('gg');
        expect(value).toBe(undefined);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.set(key, expectedValue);
        const value = await instance.getWithOptions(key);
        expect(value?.value).toBe(expectedValue);
    });
});

describe('getSet', () => {
    it('undefined value', async () => {
        const value = await instance.getSet('gg', Math.random());
        expect(value).toBe(undefined);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.set(key, expectedValue);
        const value = await instance.getSet(key, Math.random());
        expect(value).toBe(expectedValue);
    });
});
