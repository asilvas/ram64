import { readFile } from 'fs/promises';
import { getHash } from './util/hash';
import { CacheObject } from './types';

export type RAMFunctionHandler = (obj: CacheObject|undefined, params: any) => CacheObject;

export class RAMFunction {
    constructor(id: number, code: string, fn: RAMFunctionHandler) {
        this.#id = id;
        this.#code = code;
        this.#fn = fn;
    }

    #id: number;
    #code: string;
    #fn: RAMFunctionHandler;

    get id(): number {
        return this.#id;
    }

    get code(): string {
        return this.#code;
    }

    get fn(): RAMFunctionHandler {
        return this.#fn;
    }

    static fromFile(filePath: string, testCache?: CacheObject, testParams?: any): Promise<RAMFunction> {
        return readFile(filePath, 'utf8').then(code => RAMFunction.fromString(code, testCache, testParams));
    }

    static fromString(code: string, testCache?: CacheObject, testParams?: any): RAMFunction {
        let fnHandler;
        try {
            fnHandler = new Function('cacheObject', 'params', code) as RAMFunctionHandler;
            fnHandler(undefined, undefined);
            fnHandler(undefined, {});
            const frozenCache: CacheObject = { value: null };
            Object.freeze(frozenCache); // throw (only on strict mode) if input is attempted to mutate
            fnHandler(frozenCache, undefined);
            fnHandler(testCache, testParams);
        } catch (ex) {
            throw new Error(`RAMFunction did not pass validation: ${(ex as Error).message}`);
        }

        const id: number = getHash(code);

        return new RAMFunction(id, code, fnHandler);
    }    
}
