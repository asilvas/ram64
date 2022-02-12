import { getHash } from '../util/hash';
import { Shards } from './shards';

export function getShardFromKey(key: string) {
    // shard requires a unique hash compared to worker hash for even distribution
    return getShardFromHash(getHash(key+'s'));
}

function getShardFromHash(keyHash: number) {
    const shardI = keyHash % Shards.length;
    return Shards[shardI];
}
