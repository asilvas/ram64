import { CommandFn, CommandOptions } from '../../commands';
import { Shard, CacheObject } from '../../types';
import { fn as del } from './del';

export const fn: CommandFn = (opts: CommandOptions): void => {
    const shard = opts.shard as Shard;
    const obj: CacheObject = opts.args as CacheObject;

    if (obj?.value === undefined) {
        del(opts);
    } else {
        shard.map.set(opts.key as string, obj);
    }
}
