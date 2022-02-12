import { startup, RAM64 } from '../src';

let instance: RAM64;

beforeAll(async () => {
    instance = await startup({ threadCount: 2 });
});

afterAll(async () => {
    await instance.shutdown();
});

describe('numAdd', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const val1 = 0;
        const val2 = Math.random();
        const expectedValue = val1 + val2;
        await instance.set(key, val1);
        const value = await instance.numAdd(key, val2);
        expect(value).toBe(expectedValue);
    });

    it('non-default value', async () => {
        const key = Math.random().toString();
        const val1 = 5;
        const val2 = Math.random();
        const expectedValue = val1 + val2;
        await instance.set(key, val1);
        const value = await instance.numAdd(key, val2, 5);
        expect(value).toBe(expectedValue);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        const val1 = Math.random();
        const val2 = Math.random();
        const expectedValue = val1 + val2;
        await instance.set(key, val1);
        const value = await instance.numAdd(key, val2);
        expect(value).toBe(expectedValue);
    });
});

describe('numSub', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const val1 = 0;
        const val2 = Math.random();
        const expectedValue = val1 - val2;
        await instance.set(key, val1);
        const value = await instance.numSub(key, val2);
        expect(value).toBe(expectedValue);
    });

    it('non-default value', async () => {
        const key = Math.random().toString();
        const val1 = 5;
        const val2 = Math.random();
        const expectedValue = val1 - val2;
        await instance.set(key, val1);
        const value = await instance.numSub(key, val2, 5);
        expect(value).toBe(expectedValue);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        const val1 = Math.random();
        const val2 = Math.random();
        const expectedValue = val1 - val2;
        await instance.set(key, val1);
        const value = await instance.numSub(key, val2);
        expect(value).toBe(expectedValue);
    });
});

describe('numMult', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const val1 = 0;
        const val2 = Math.random();
        const expectedValue = val1 * val2;
        await instance.set(key, val1);
        const value = await instance.numMult(key, val2);
        expect(value).toBe(expectedValue);
    });

    it('non-default value', async () => {
        const key = Math.random().toString();
        const val1 = 5;
        const val2 = Math.random();
        const expectedValue = val1 * val2;
        await instance.set(key, val1);
        const value = await instance.numMult(key, val2, 5);
        expect(value).toBe(expectedValue);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        const val1 = Math.random();
        const val2 = Math.random();
        const expectedValue = val1 * val2;
        await instance.set(key, val1);
        const value = await instance.numMult(key, val2);
        expect(value).toBe(expectedValue);
    });
});

describe('numDiv', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const val1 = 0;
        const val2 = Math.random();
        const expectedValue = val1 / val2;
        await instance.set(key, val1);
        const value = await instance.numDiv(key, val2);
        expect(value).toBe(expectedValue);
    });

    it('non-default value', async () => {
        const key = Math.random().toString();
        const val1 = 5;
        const val2 = Math.random();
        const expectedValue = val1 / val2;
        await instance.set(key, val1);
        const value = await instance.numDiv(key, val2, 5);
        expect(value).toBe(expectedValue);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        const val1 = Math.random();
        const val2 = Math.random();
        const expectedValue = val1 / val2;
        await instance.set(key, val1);
        const value = await instance.numDiv(key, val2);
        expect(value).toBe(expectedValue);
    });
});
