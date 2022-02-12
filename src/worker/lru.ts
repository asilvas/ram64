import { workerData } from './worker-data';
import { Shards } from './shards';
import { memoryUsage } from 'process';

const maxMemory = workerData.maxMemory ?? Infinity;
const EVICTIONS_PER_CYCLE = 200; // should be sufficiently aggressive with minimal impact on performance

export const isLRUEnabled = (workerData.maxMemory ?? 0) > 0;

export function evict(): void {
    let shardI = 0;
    if (memoryUsage().rss > maxMemory) { // while OOM, evict!
        let cycle = 0;
        while (cycle < EVICTIONS_PER_CYCLE) {
            let { map } = Shards[shardI];
            const nextKey = map.keys().next().value;
            if (nextKey !== undefined) {
                map.delete(nextKey);
            }

            cycle++; // next shard regardless if there was a delete -- avoids poor memory settings causing infinite loops
            shardI = (shardI + 1) % Shards.length;
        }
    }
}
