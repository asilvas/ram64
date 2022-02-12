import { CommandFn, CommandOptions } from '../../commands';
import type { CacheObject } from '../../types';
import { fn as getWithOptions } from './getWithOptions';
import { fn as del } from './del';
import { fn as setWithOptions } from './setWithOptions';

export const fn: CommandFn = (opts: CommandOptions): CacheObject|undefined => {
    const obj = getWithOptions(opts);
    if (!obj) return void 0;

    del(opts);
    setWithOptions({ ...opts, args: obj });

    return obj;
}
