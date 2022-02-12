import { CommandFn, CommandOptions } from '../../commands';
import type { Shard, CacheObject } from '../../types';
import { isLRUEnabled } from '../lru';

export const fn: CommandFn = (opts: CommandOptions): CacheObject|undefined => {
    const shard = opts.shard as Shard;
    const obj = shard.map.get(opts.key as string);
    if (obj?.expAt && obj?.expAt <= Date.now()) {
        shard.map.delete(opts.key as string); // remove key if expired
        return void 0;
    }

    if (isLRUEnabled) { // move back to front
        shard.map.delete(opts.key as string);
        shard.map.set(opts.key as string, obj as CacheObject);
    }

    return obj;
}
