import { CommandFn, CommandOptions } from '../../commands';
import { get as getFn } from '../functions';
import { ScanResult } from '../../types';
import { Shards } from '../shards';
import { RAMFunction } from '../../ram-function';
import lru from 'tiny-lru';
import { randomString } from '../../util/rand';
import { workerData } from '../worker-data';

const scanCache = lru(10, 1000 * 60 * 60); // 1hr

export const fn: CommandFn = (opts: CommandOptions): ScanResult => {
    const { resumeKey, limit, filterExp, filterFn } = opts.args;

    const filterFnHandler: RAMFunction|undefined = filterFn && getFn(filterFn);

    let shardIndex = 0;
    let iterator: IterableIterator<string>|undefined;
    let iteratorKey: string|undefined;
    if (resumeKey) {
        const resumeKeyParts = resumeKey.split(':');
        shardIndex = parseInt(resumeKeyParts[1], 10);
        iteratorKey = resumeKeyParts[2] as string;
        iterator = scanCache.get(iteratorKey);
    }
    let shard = Shards[shardIndex];
    if (!shard) {
        throw new Error(`Shard ${shardIndex} does not exist`);
    }
    if (!iterator) {
        iterator = shard.map.keys();
        if (!iteratorKey) {
            iteratorKey = randomString();
            scanCache.set(iteratorKey, iterator);
        }
    }

    const keys = [];
    let key: string;
    let nextResumeKey: string|undefined = resumeKey;
    do {
        key = iterator.next().value;
        if (key) {
            if (
                (!filterFnHandler && !filterExp) ||
                (filterFnHandler && filterFnHandler.fn(undefined, { key, shardIndex: shard.shardIndex })) ||
                (filterExp && filterExp.test(key))
            ) {
                keys.push(key);
            }
        } else { // shard out of keys, start iterating next shard
            shardIndex++;
            shard = Shards[shardIndex];
            if (!shard) { // out of shards
                break;
            }

            iterator = shard.map.keys();
            scanCache.delete(iteratorKey as string); // cleanup old iterator if we know we're done with it
            iteratorKey = randomString();
            scanCache.set(iteratorKey, iterator);
            nextResumeKey = undefined; // must rebuild
        }
    } while (shard && keys.length < limit);

    if (!nextResumeKey) {
        if (shard) { // if shard exists we can resume using current iterator
            nextResumeKey = `${workerData.workerIndex}:${shardIndex}:${iteratorKey}`;
        } else { // time to move onto the next worker
            if (workerData.workerIndex + 1 < workerData.workerCount) {
                nextResumeKey = `${workerData.workerIndex + 1}:0:`;
            } // else we're done, no more resuming to do
        }
    }

    return {
        keys,
        resumeKey: nextResumeKey
    } as ScanResult;
}
