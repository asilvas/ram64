import { Worker } from 'worker_threads';
import { WorkerData } from '../types';

// if we ever support native ESM, we can use import.meta.url (via dynamic eval function)
export const WORKER_PATH = require.resolve('../../lib/worker');

export type CreateWorkerOptions = {    
    connectKey: string;
    workerIndex: number;
    workerCount: number;
    shardIndex: number;
    shardsPerThread: number;
    shardCount: number;
    maxMemory?: number;
}

export function createWorker({
    connectKey,
    workerIndex,
    workerCount,
    shardIndex,
    shardsPerThread,
    shardCount,
    maxMemory
}: CreateWorkerOptions): Worker {
    const workerData: WorkerData = {
        connectKey,
        workerIndex,
        workerCount,
        shardIndex,
        shardsPerThread,
        shardCount,
        maxMemory
    };

    const worker = new Worker(WORKER_PATH, {
        workerData
    });

    return worker;
}
