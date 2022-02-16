import { Worker } from 'worker_threads';
import { WorkerData } from '../types';

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

    const worker = new Worker('./lib/worker/index.js', {
        workerData
    });

    return worker;
}
