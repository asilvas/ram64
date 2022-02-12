import { startup, RAM64 } from '../src';

let instance: RAM64;

beforeAll(async () => {
    instance = await startup({ threadCount: 2 });
});

afterAll(async () => {
    await instance.shutdown();
});

describe('setGetMembers', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const value = await instance.setGetMembers(key);
        expect(value).toBe(undefined);
    });

    it('string value', async () => {
        const key = Math.random().toString();
        await instance.setAddMembers(key, ['gg']);
        const value = await instance.setGetMembers(key) as Set<any>;
        expect([...value]).toEqual(['gg']);
    });

    it('number value', async () => {
        const key = Math.random().toString();
        await instance.setAddMembers(key, [123]);
        const value = await instance.setGetMembers(key) as Set<any>;
        expect([...value]).toEqual([123]);
    });
});

describe('setAddMembers', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        await instance.setAddMembers(key, ['gg']);
        const value = await instance.setGetMembers(key) as Set<any>;
        expect([...value]).toEqual(['gg']);
    });

    it('add to existing', async () => {
        const key = Math.random().toString();
        await instance.setAddMembers(key, ['a']);
        await instance.setAddMembers(key, ['b']);
        const value = await instance.setGetMembers(key) as Set<any>;
        expect([...value]).toEqual(['a', 'b']);
    });

    it('duplicates', async () => {
        const key = Math.random().toString();
        await instance.setAddMembers(key, ['a', 'b', 'a', 'b']);
        const value = await instance.setGetMembers(key) as Set<any>;
        expect([...value]).toEqual(['a', 'b']);
    });
});

describe('setRemoveMembers', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        await instance.setRemoveMembers(key, ['gg']);
        const value = await instance.setGetMembers(key) as Set<any>;
        expect([...value]).toEqual([...new Set()]);
    });

    it('valid', async () => {
        const key = Math.random().toString();
        await instance.setAddMembers(key, ['a', 'b']);
        const value = await instance.setRemoveMembers(key, ['b']);
        expect(value).toBe(1);
    });

    it('duplicates', async () => {
        const key = Math.random().toString();
        await instance.setAddMembers(key, ['a', 'b']);
        const value = await instance.setRemoveMembers(key, ['b', 'b']);
        expect(value).toBe(1);
    });
});

describe('setGetMemberCount', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const value = await instance.setGetMemberCount(key);
        expect(value).toBe(0);
    });

    it('expected value', async () => {
        const key = Math.random().toString();
        const expectedValue = Math.random().toString();
        await instance.setAddMembers(key, ['a', 'b']);
        const value = await instance.setGetMemberCount(key);
        expect(value).toBe(2);
    });
});

describe('setHasMembers', () => {
    it('undefined value', async () => {
        const key = Math.random().toString();
        const value = await instance.setHasMembers(key, ['gg']);
        expect(value).toBe(0);
    });

    it('full match', async () => {
        const key = Math.random().toString();
        await instance.setAddMembers(key, ['a', 'b', 'c']);
        const value = await instance.setHasMembers(key, ['b', 'c']);
        expect(value).toBe(2);
    });

    it('duplicates', async () => {
        const key = Math.random().toString();
        await instance.setAddMembers(key, ['a', 'b']);
        const value = await instance.setHasMembers(key, ['b', 'b']);
        expect(value).toBe(2);
    });
});
