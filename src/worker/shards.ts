import { workerData } from './worker-data';
import type { Shard, CacheObject } from '../types';

export const Shards: Array<Shard> = Array.from({ length: workerData.shardsPerThread }).map((v, index) => {
    const map = new Map<string, CacheObject>();

    return { index, shardIndex: workerData.shardIndex + index, map };
});
