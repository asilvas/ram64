import { workerData } from './worker-data';
import type { Shard, CacheObject } from '../types';

const baseShardIndex = workerData.shardIndex * workerData.shardsPerThread;

export const Shards: Array<Shard> = Array.from({ length: workerData.shardsPerThread }).map((v, index) => {
    const map = new Map<string, CacheObject>();

    return { index, shardIndex: baseShardIndex+index, map };
});
