import { RAMFunction } from '../ram-function';

// Do NOT export
const functions: Map<number, RAMFunction> = new Map();

export function get(id: number): RAMFunction | undefined {
    return functions.get(id);
}

export function set(code: string): RAMFunction {
    const fn = RAMFunction.fromString(code);

    functions.set(fn.id, fn);

    return fn;
}
