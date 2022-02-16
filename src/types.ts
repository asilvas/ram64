import { RAMFunction } from "./ram-function";

export type Shard = {
    index: number;
    shardIndex: number;
    map: Map<string, CacheObject>; // key/value
}

export type StartupOptions = {
    shardCount?: number;
    threadCount?: number;
}

export type WorkerData = {
    connectKey: string;
    workerIndex: number;
    workerCount: number;
    shardIndex: number;
    shardsPerThread: number;
    shardCount: number;
    maxMemory?: number;
}

export type MessageToWorker = {
    ram64: boolean;
    commandIndex?: number;
    requestId?: string;
    key?: string;
    args?: any;
}

export type MessageToMain = {
    ram64: boolean;
    command: string;
    requestId?: string;
    args?: any;
}

export type BroadcastMessageToMain = {
    ram64: boolean;
    command: string;
    args?: any;
}

export type MessageFromWorker = {
    ram64: boolean;
    requestId?: string;
    value?: any;
    error?: any;
}

export type MessageFromMain = {
    ram64: boolean;
    requestId?: string;
    value?: any;
    error?: any;
}

export type CacheOptions = {
    expAt?: number;
    staleAt?: number;
}

export interface CacheObject extends CacheOptions {
    value: any;
}

export type ScanOptions = {
    limit?: number;
    filter?: RegExp|RAMFunction;
    resumeCb?: (lastResult: ScanResult) => Promise<boolean>;
    resumeKey?: string;
}

export type ScanResult = {
    keys: string[];
    resumeKey?: string;
}
