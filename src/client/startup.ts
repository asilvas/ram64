import { isMainThread } from 'worker_threads';
import { cpus } from 'os';
import { RAM64 } from '.';
import { createWorker } from './create-worker';
import { randomString } from "../util/rand";

const CPU_COUNT =  cpus().length;

export type StartupOptions = {
    threadCount?: number;
    shardCount?: number;
    maxMemory?: number;
}

export const DEFAULT_SHARD_COUNT = 4096;

export async function startup({ threadCount = CPU_COUNT, shardCount = DEFAULT_SHARD_COUNT, maxMemory }: StartupOptions = {}): Promise<RAM64> {
    if (!isMainThread) throw new Error(`RAM64.startup() must be called from the main thread`);

    const connectKey: string = randomString();

    const shardsPerThread = Math.ceil(shardCount / threadCount);
    shardCount = shardsPerThread * threadCount;

    // TODO: support timeouts/errors?

    const promise: Promise<RAM64> = new Promise((resolve, reject) => {
        // create workers
        const workers = Array.from({ length: threadCount }).map((v, workerIndex) => createWorker({
            connectKey,
            workerIndex,
            workerCount: threadCount,
            shardIndex: (workerIndex * shardsPerThread),
            shardsPerThread,
            shardCount,
            maxMemory
        }));

        const instance = new RAM64({ connectKey, workers });

        // wait until the first message is received from each worker
        return Promise.all(workers.map(worker => new Promise(resolve2 => worker.once('message', resolve2)).then(() => resolve(instance))));
    });

    return promise;
}
