import { startup, RAM64 } from '../src';

let instance: RAM64;

beforeAll(async () => {
    instance = await startup({ threadCount: 2 });
});

afterAll(async () => {
    await instance.shutdown();
});

describe('del', () => {
    it('return false if no prior key', async () => {
        const key = Math.random().toString();
        const ret = await instance.del(key);
        expect(ret).toBe(false);
    });

    it('return true if key was deleted', async () => {
        const key = Math.random().toString();
        await instance.set(key, Math.random());
        const ret = await instance.del(key);
        expect(ret).toBe(true);
    });

    it('verified value no longer exists', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.set(key, expectedValue);
        let value = await instance.get(key);
        expect(value).toBe(expectedValue);
        await instance.del(key);
        value = await instance.get(key);
        expect(value).toBe(undefined);
    });
});

describe('deleteAll', () => {
    it('verified value no longer exists', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random();
        await instance.set(key, expectedValue);
        let value = await instance.get(key);
        expect(value).toBe(expectedValue);
        await instance.deleteAll();
        value = await instance.get(key);
        expect(value).toBe(undefined);
    });
});
