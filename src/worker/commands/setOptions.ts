import { CommandFn, CommandOptions } from '../../commands';
import { CacheObject } from '../../types';
import { fn as getWithOptions } from './getWithOptions';

export const fn: CommandFn = (opts: CommandOptions): boolean => {
    const obj: CacheObject = getWithOptions(opts);
    if (!obj) return false;
    if (typeof opts.args !== 'object') throw new Error('Invalid options');
    
    // mutate is the most performant option
    obj.expAt = opts.args.expAt ?? void 0;
    obj.staleAt = opts.args.staleAt ?? void 0;

    return true;
}
