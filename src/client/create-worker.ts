import { Worker } from 'worker_threads';
import { WorkerData } from '../types';

export type CreateWorkerOptions = {
    connectKey: string;
    shardIndex: number;
    shardsPerThread: number;
    shardCount: number;
    maxMemory?: number;
}

export function createWorker({
    connectKey,
    shardIndex,
    shardsPerThread,
    shardCount,
    maxMemory
}: CreateWorkerOptions): Worker {
    const workerData: WorkerData = {
        connectKey,
        shardIndex,
        shardsPerThread,
        shardCount,
        maxMemory
    };

    const worker = new Worker('./lib/worker/index.js', {
        workerData
    });

    return worker;
}
