import { CommandFn, CommandOptions } from '../../commands';
import type { Shard } from '../../types';

export const fn: CommandFn = (opts: CommandOptions): boolean => {
    const shard = opts.shard as Shard;
    return shard.map.delete(opts.key as string);
}
