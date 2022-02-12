import { startup, RAM64 } from '../src';
import { readFile } from 'fs/promises';

let instance: RAM64;

beforeAll(async () => {
    instance = await startup({ threadCount: 1, shardCount: 1 });
});

afterAll(async () => {
    await instance.shutdown();
});

beforeEach(async () => {
    await instance.deleteAll();
});

describe('save', () => {
    it('empty arr', async () => {
        await instance.save('./test/save');
        await expect((async () => {
            let json: string;
            json = await readFile('./test/save/shard0.json', 'utf8');
            const shard0 = JSON.parse(json) as string;
        })()).resolves.toBe(undefined);
    });

    it('primitive types', async () => {
        instance.set('a', 1);
        instance.set('b', '2');
        instance.set('c', true);
        await instance.save('./test/save');
        const json = await readFile('./test/save/shard0.json', 'utf8');
        const shard0 = JSON.parse(json) as string;
        await expect(shard0).toEqual([["a",{value:1}],["b",{value:"2"}],["c",{value:true}]]);
    });

    it('maps/sets', async () => {
        instance.set('a', new Set([1, 2]));
        instance.set('b', new Map([['a', 1], ['b', 2]]));
        await instance.save('./test/save');
        const json = await readFile('./test/save/shard0.json', 'utf8');
        const shard0 = JSON.parse(json) as string;
        await expect(shard0).toEqual([["a",{"value":{"$set":[1,2]}}],["b",{"value":{"$map":[["a",1],["b",2]]}}]]);
    });
});

describe('load', () => {
    it('empty arr', async () => {
        await instance.save('./test/save');
        await instance.load('./test/save');
    });

    it('primitive types', async () => {
        instance.set('a', 1);
        instance.set('b', '2');
        instance.set('c', true);
        await instance.save('./test/save');
        await instance.deleteAll();
        await instance.load('./test/save');
        const a = await instance.get('a');
        expect(a).toBe(1);
        const b = await instance.get('b');
        expect(b).toBe('2');
        const c = await instance.get('c');
        expect(c).toBe(true);
    });

    it('maps/sets', async () => {
        instance.set('a', new Set([1, 2]));
        instance.set('b', new Map([['a', 1], ['b', 2]]));
        await instance.save('./test/save');
        await instance.deleteAll();
        await instance.load('./test/save');
        const a = await instance.get('a');
        expect([...a]).toEqual([1, 2]);
        const b = await instance.get('b');
        expect([...b]).toEqual([['a', 1], ['b', 2]]);
    });
});
