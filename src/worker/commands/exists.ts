import { CommandFn, CommandOptions } from '../../commands';
import type { CacheObject } from '../../types';
import { fn as getWithOptions } from './getWithOptions';

export const fn: CommandFn = (opts: CommandOptions): boolean => {
    const obj: CacheObject = getWithOptions(opts);

    return !!obj;
}
