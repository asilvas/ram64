import { startup, RAM64 } from '../src';

let instance: RAM64;

beforeAll(async () => {
    instance = await startup({ threadCount: 2 });
});

afterAll(async () => {
    await instance.shutdown();
});

describe('strAppend', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random().toString();
        const value = await instance.strAppend(key, expectedValue);
        expect(value).toBe(expectedValue);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random().toString();
        await instance.set(key, 'gg');
        const value = await instance.strAppend(key, expectedValue);
        expect(value).toBe('gg' + expectedValue);
    });
});

describe('strGetRange', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const value = await instance.strGetRange(key, 5, 10);
        expect(value).toBe('');
    });

    it('valid range', async () => {
        const key = Math.random().toString();
        await instance.set(key, '0123456789');
        const value = await instance.strGetRange(key, 2, 4);
        expect(value).toBe('23');
    });

    it('invalid range', async () => {
        const key = Math.random().toString();
        await instance.set(key, '0123456789');
        const value = await instance.strGetRange(key, 12, 14);
        expect(value).toBe('');
    });
});

describe('strLength', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const value = await instance.strLength(key);
        expect(value).toBe(0);
    });

    it('valid range', async () => {
        const key = Math.random().toString();
        await instance.set(key, '0123456789');
        const value = await instance.strLength(key);
        expect(value).toBe(10);
    });
});

describe('strPrepend', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random().toString();
        const value = await instance.strPrepend(key, expectedValue);
        expect(value).toBe(expectedValue);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random().toString();
        await instance.set(key, 'gg');
        const value = await instance.strPrepend(key, expectedValue);
        expect(value).toBe(expectedValue + 'gg');
    });
});

describe('strReplace', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random().toString();
        const value = await instance.strReplace(key, 'from', expectedValue);
        expect(value).toBe('');
    });

    it('string match', async () => {
        const key = Math.random().toString();
        await instance.set(key, '0123456789');
        const value = await instance.strReplace(key, '45', 'gg');
        expect(value).toBe('0123gg6789');
    });

    it('regex match', async () => {
        const key = Math.random().toString();
        await instance.set(key, '0123456789');
        const value = await instance.strReplace(key, /(2|7)/g, 'gg');
        expect(value).toBe('01gg3456gg89');
    });
});

describe('strSetRange', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const value = await instance.strSetRange(key, 0, 'gg');
        expect(value).toBe('gg');
    });

    it('out of range value', async () => {
        const key = Math.random().toString();
        const value = await instance.strSetRange(key, 5, 'gg');
        expect(value).toBe('gg');
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random().toString();
        await instance.set(key, '0123456789');
        const value = await instance.strSetRange(key, 5, 'gg');
        expect(value).toBe('01234gg56789');
    });
});
