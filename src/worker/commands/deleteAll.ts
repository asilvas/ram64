import { CommandFn, CommandOptions } from '../../commands';
import { Shards } from '../shards';

export const fn: CommandFn = (opts: CommandOptions): void => {
    Shards.forEach(shard => shard.map.clear());
}
