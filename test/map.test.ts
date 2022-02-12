import { startup, RAM64 } from '../src';

let instance: RAM64;

beforeAll(async () => {
    instance = await startup({ threadCount: 2 });
});

afterAll(async () => {
    await instance.shutdown();
});

describe('mapGetKeys', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const value = await instance.mapGetKeys(key);
        expect(value).toBe(undefined);
    });

    it('existing value', async () => {
        const key = Math.random().toString();
        await instance.mapAddFields(key, [['gg', 123 ]]);
        const value = await instance.mapGetKeys(key) as string[];
        expect([...value]).toEqual(['gg']);
    });
});

describe('mapGetFields', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const value = await instance.mapGetFields(key);
        expect(value).toBe(undefined);
    });

    it('existing value', async () => {
        const key = Math.random().toString();
        await instance.mapAddFields(key, [['gg', 123 ]]);
        const value = await instance.mapGetFields(key) as Map<string, any>;
        expect([...value]).toEqual([['gg', 123]]);
    });
});

describe('mapAddFields', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        await instance.mapAddFields(key, [['gg', 123]]);
        const value = await instance.mapGetFields(key) as Map<string, any>;
        expect([...value]).toEqual([['gg', 123]]);
    });

    it('add to existing', async () => {
        const key = Math.random().toString();
        await instance.mapAddFields(key, [['a', 1]]);
        await instance.mapAddFields(key, [['b', 2]]);
        const value = await instance.mapGetFields(key) as Map<string, any>;
        expect([...value]).toEqual([['a', 1], ['b', 2]]);
    });

    it('duplicates last in wins', async () => {
        const key = Math.random().toString();
        await instance.mapAddFields(key, [['a', 1], ['b', 2], ['a', 2], ['b', 1]]);
        const value = await instance.mapGetFields(key) as Map<string, any>;
        expect([...value]).toEqual([['a', 2], ['b', 1]]);
    });
});

describe('mapRemoveKeys', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        await instance.mapRemoveKeys(key, ['gg']);
        const value = await instance.mapGetFields(key) as Map<string, any>;
        expect([...value]).toEqual([]);
    });

    it('valid', async () => {
        const key = Math.random().toString();
        await instance.mapAddFields(key, [['a', 1], ['b', 2]]);
        const value = await instance.mapRemoveKeys(key, ['b']);
        expect(value).toBe(1);
    });

    it('duplicates', async () => {
        const key = Math.random().toString();
        await instance.mapAddFields(key, [['a', 1], ['b', 2]]);
        const value = await instance.mapRemoveKeys(key, ['b', 'b']);
        expect(value).toBe(1);
    });
});

describe('mapGetCount', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const value = await instance.mapGetCount(key);
        expect(value).toBe(0);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        await instance.mapAddFields(key, [['a', 1], ['b', 2]]);
        const value = await instance.mapGetCount(key);
        expect(value).toBe(2);
    });
});

describe('mapHasKeys', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const value = await instance.mapHasKeys(key, ['gg']);
        expect(value).toBe(0);
    });

    it('full match', async () => {
        const key = Math.random().toString();
        await instance.mapAddFields(key, [['a', 1], ['b', 2], ['c', 3]]);
        const value = await instance.mapHasKeys(key, ['b', 'c']);
        expect(value).toBe(2);
    });

    it('duplicates', async () => {
        const key = Math.random().toString();
        await instance.mapAddFields(key, [['a', 1], ['b', 2]]);
        const value = await instance.mapHasKeys(key, ['b', 'b']);
        expect(value).toBe(2);
    });
});
