import { CommandFn, CommandOptions } from '../../commands';
import { Shards } from '../shards';

export const fn: CommandFn = (opts: CommandOptions): number => {
    return Shards.reduce((acc, shard) => acc + shard.map.size, 0);
}
