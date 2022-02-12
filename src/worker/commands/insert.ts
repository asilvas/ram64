import { CommandFn, CommandOptions } from '../../commands';
import { CacheObject } from '../../types';
import { fn as getWithOptions } from './getWithOptions';
import { fn as set } from './set';

export const fn: CommandFn = (opts: CommandOptions): boolean => {
    const obj: CacheObject = getWithOptions(opts);
    if (obj) return false;

    set(opts);

    return true;
}
