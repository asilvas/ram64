import { CommandFn, CommandOptions } from '../../commands';
import { fn as getWithOptions } from './getWithOptions';
import { get as getFn } from '../functions';
import { fn as setWithOptions } from './setWithOptions';
import { CacheObject } from '../../types';

export const fn: CommandFn = (opts: CommandOptions): CacheObject|undefined => {
    const obj = getWithOptions(opts);
    const fn = getFn(opts.args?.fnId);
    if (!fn) throw new Error(`Function ${opts.args?.fnId} not found`);

    const fnResult: CacheObject|undefined = fn.fn(obj, opts.args?.params);
    const newObj: CacheObject = (typeof fnResult === 'object' && 'value' in fnResult) ? fnResult : { value: fnResult };
    setWithOptions({ ...opts, args: newObj });

    return newObj;
}
