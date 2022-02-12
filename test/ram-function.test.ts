import { CacheObject, RAMFunction } from '../src';

describe('RAMFunction', () => {
    it('valid string function', () => {
        const fn = RAMFunction.fromString('return true');
        expect(fn).toBeInstanceOf(RAMFunction);
    });

    it('valid file function', async () => {
        const fn = await RAMFunction.fromFile('./test/ram-function.js');
        expect(fn).toBeInstanceOf(RAMFunction);
    });

    it('invalid string function', () => {
        expect(() => {
            RAMFunction.fromString('a=b');
        }).toThrow();
    });

    it('can handle undefined cacheObject', () => {
        const fn = RAMFunction.fromString('return cacheObject?.jeff');
        expect(fn).toBeInstanceOf(RAMFunction);
    });

    it('can handle undefined params', () => {
        const fn = RAMFunction.fromString('return params?.frank');
        expect(fn).toBeInstanceOf(RAMFunction);
    });

    it('validate testCache & testParams', () => {
        const testCache: CacheObject = { value: 'apple' };
        const testParams = { frank: 'banana' };
        const fn = RAMFunction.fromString('return cacheObject?.value + params?.frank', testCache, testParams);
        expect(fn).toBeInstanceOf(RAMFunction);
        expect(fn.fn).not.toBe(undefined);
        if (fn.fn) {
            expect(fn.fn(testCache, testParams)).toBe('applebanana');
        }
    });

    it('throw if cannot handle undefined cacheObject', () => {
        expect(() => {
            RAMFunction.fromString('return cacheObject.jeff');
        }).toThrow();
    });

    it('throw if cannot handle undefined params', () => {
        expect(() => {
            RAMFunction.fromString('return params.frank');
        }).toThrow();
    });
});
