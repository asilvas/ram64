import { Worker, MessagePort } from 'worker_threads';
import { commandsDict } from '../commands';
import { processRequest } from './process-request';
import { getHash } from '../util/hash';
import { CacheObject, CacheOptions, MessageToMain, ScanOptions, ScanResult, RegisterWorkerOptions } from '../types';
import { processServerRequest } from './process-server-request';
import { processResponse } from './process-response';
import { RAMFunction } from '../ram-function';
import { mkdir } from 'fs/promises';
import { isRAM64Message } from './is-ram64-message';
import pLimit from 'p-limit';

export type RAM64Options = {
    connectKey: string;
    workers?: Worker[];
    ports?: MessagePort[];
    shardCount: number;
    concurrency: number;
}

export class RAM64 {
    constructor({ connectKey, workers, ports, shardCount, concurrency }: RAM64Options) {
        this.#connectKey = connectKey;
        this.#cacheWorkers = workers;
        this.#ports = ports;
        this.#shardCount = shardCount;
        this.#concurrency = Math.max(1, concurrency);
        this.#limit = this.#concurrency ? pLimit(this.#concurrency) : (handler: Function) => handler();

        this.workerPorts.forEach(port => {
            port.unref();
            port.on('message', msg => processResponse(msg));
            port.on('messageerror', err => console.error('Worker message error:', err)); // TODO: need better handling
            port.on('error', err => console.error('Worker error:', err)); // TODO: need better handling    

            // TODO! handle 'close' event
        });
    }

    #connectKey: string;
    #cacheWorkers?: Worker[];
    #ports?: MessagePort[];
    #shardCount: number;
    #concurrency: number;
    #limit: pLimit.Limit | ((handler: Function) => Promise<any>);
 
    get connectKey(): string { return this.#connectKey; }

    getPort(key: string): Worker|MessagePort|undefined {
        return this.getPortFromHash(getHash(key));
    }

    getPortFromHash(hash: number): Worker|MessagePort|undefined {
        return this.workerPorts[hash % this.workerPorts.length];
    }

    get workerPorts(): (Worker | MessagePort)[] {
        return this.#cacheWorkers || this.#ports || [];
    }

    get shardCount(): number {
        return this.#shardCount;
    }

    get shardsPerWorker(): number {
        return Math.ceil(this.shardCount / this.workerPorts.length);
    }

    get concurrency(): number {
        return this.#concurrency;
    }

    get limit(): pLimit.Limit {
        return this.#limit;
    }

    get isMain(): boolean {
        return (this.#cacheWorkers as Worker[])?.length > 0;
    }

    spawnWorker(filePath: string, workerData: object = {}, options: RegisterWorkerOptions = {}): Worker {
        const worker = new Worker(filePath, {
            workerData: {
                ...workerData,
                connectKey: this.connectKey
            }
        });
        worker.unref();
        this.registerWorker(worker, options);
        return worker;
    }

    registerWorker(worker: Worker, options: RegisterWorkerOptions = {}): Worker {
        worker.on('message', msg => {
            if (isRAM64Message(msg)) {
                processServerRequest(this, worker, msg as MessageToMain)
            } else if (options.onMessage) {
                options.onMessage.call(this, msg);
            }        
        });

        return worker;
    }

    // throw everything away
    async shutdown() {
        if (!this.isMain) return Promise.reject(new Error(`RAM64.shutdown() must be called from the main instance`));
                
        // TODO: perhaps something more graceful in the future? like waiting for each worker to exit gracefully on its own
        //       especially useful once we support pending operations like save/load/dump

        if (this.#cacheWorkers) {
            this.#cacheWorkers.forEach(worker => worker.terminate());
            this.#cacheWorkers = [];
        }
        if (this.#ports) {
            this.#ports.forEach(port => port.close());
            this.#ports = [];
        }

        this.#connectKey = '';
    }

    save(dirPath: string): Promise<void> {        
        return mkdir(dirPath, { recursive: true }).then(() => processRequest(this, {
            commandIndex: commandsDict.save.index,
            args: { dirPath }
        })) as Promise<void>;
    }

    load(dirPath: string): Promise<void> {
        return processRequest(this, {
            commandIndex: commandsDict.load.index,
            args: { dirPath }
        }) as Promise<void>;
    }

    registerFunction(fn: RAMFunction): Promise<RAMFunction> {
        return processRequest(this, {
            commandIndex: commandsDict.registerFunction.index,
            args: { fnCode: fn.code }
        }).then(() => fn);
    }

    exists(key: string): Promise<boolean> {
        return processRequest(this, {
            commandIndex: commandsDict.exists.index,
            key
        }) as Promise<boolean>;
    }

    get(key: string): Promise<any> {
        return processRequest(this, {
            commandIndex: commandsDict.get.index,
            key
        }) as Promise<any>;
    }

    async getKeyCount(): Promise<number> {
        const keys = await Promise.all(this.workerPorts.map(port => processRequest(this, {
            workerOrPort: port,
            commandIndex: commandsDict.getKeyCount.index
        }))) as number[];

        return keys.reduce((acc, val) => acc + val, 0);
    }

    getMany(keys: string[]): Promise<any[]> {
        return Promise.all(keys.map(key => this.get(key)));
    }

    getAndSet(key: string, staleFn: (obj: CacheObject) => Promise<CacheObject>): Promise<CacheObject|undefined> {
        return this.getWithOptions(key).then((obj?: CacheObject) => {
            if (!obj || obj?.staleAt && obj?.staleAt <= Date.now()) { // non-blocking
                staleFn(obj as CacheObject).then(newObj => this.setWithOptions(key, newObj));
            }

            return obj;
        }) as Promise<CacheObject>;
    }

    getSet(key: string, value: any): Promise<any> {
        return processRequest(this, {
            commandIndex: commandsDict.getSet.index,
            key, args: { value }
        }) as Promise<any>;
    }

    getWithOptions(key: string): Promise<CacheObject|undefined> {
        return processRequest(this, {
            commandIndex: commandsDict.getWithOptions.index,
            key
        }) as Promise<CacheObject>;
    }

    touch(key: string): Promise<CacheObject|undefined> {
        return processRequest(this, {
            commandIndex: commandsDict.touch.index,
            key
        }) as Promise<CacheObject|undefined>;
    }

    set(key: string, value: any): Promise<void> {
        return processRequest(this, {
            commandIndex: commandsDict.set.index,
            key, args: { value }
        }) as Promise<void>;
    }

    setIfValue(key: string, expectedValue: any, value: any): Promise<boolean> {
        return processRequest(this, {
            commandIndex: commandsDict.setIfValue.index,
            key, args: { expectedValue, value }
        }) as Promise<boolean>;
    }

    setFn(key: string, fn: RAMFunction, params: any): Promise<CacheObject> {
        return processRequest(this, {
            commandIndex: commandsDict.setFn.index,
            key, args: { fnId: fn.id, params }
        }) as Promise<CacheObject>;
    }

    setMany(sets: [string, any][]): Promise<void> {
        return Promise.all(sets.map(set => this.set(set[0], set[1]))).then(() => void 0);
    }

    setOptions(key: string, options: CacheOptions): Promise<boolean> {
        return processRequest(this, {
            commandIndex: commandsDict.setOptions.index,
            key, args: options
        }) as Promise<boolean>;
    }

    setWithOptions(key: string, value: CacheObject): Promise<boolean> {
        return processRequest(this, {
            commandIndex: commandsDict.setWithOptions.index,
            key, args: value
        }) as Promise<boolean>;
    }

    insert(key: string, value: any): Promise<boolean> {
        return processRequest(this, {
            commandIndex: commandsDict.insert.index,
            key, args: { value }
        }) as Promise<boolean>;
    }

    del(key: string): Promise<boolean> {
        return processRequest(this, {
            commandIndex: commandsDict.del.index,
            key
        }) as Promise<boolean>;
    }

    deleteAll(): Promise<void> {
        return processRequest(this, {
            commandIndex: commandsDict.deleteAll.index
        }) as Promise<void>;
    }

    strAppend(key: string, value: string): Promise<string> {
        return processRequest(this, {
            commandIndex: commandsDict.strAppend.index,
            key, args: { value }
        }) as Promise<string>;
    }

    strPrepend(key: string, value: string): Promise<string> {
        return processRequest(this, {
            commandIndex: commandsDict.strPrepend.index,
            key, args: { value }
        }) as Promise<string>;
    }

    strLength(key: string): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.strLength.index,
            key
        }) as Promise<number>;
    }

    strSetRange(key: string, offset: number, value: string): Promise<string> {
        return processRequest(this, {
            commandIndex: commandsDict.strSetRange.index,
            key, args: { offset, value }
        }) as Promise<string>;
    }

    strGetRange(key: string, start: number, end: number): Promise<string> {
        return processRequest(this, {
            commandIndex: commandsDict.strGetRange.index,
            key, args: { start, end }
        }) as Promise<string>;
    }

    strReplace(key: string, replace: string|RegExp, value: string): Promise<string> {
        return processRequest(this, {
            commandIndex: commandsDict.strReplace.index,
            key, args: { replace, replaceType: typeof replace, value }
        }) as Promise<string>;
    }

    numAdd(key: string, value: number, defaultValue: number = 0): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.numAdd.index,
            key, args: { value, defaultValue }
        }) as Promise<number>;
    }

    numSub(key: string, value: number, defaultValue: number = 0): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.numSub.index,
            key, args: { value, defaultValue }
        }) as Promise<number>;
    }

    numMult(key: string, value: number, defaultValue: number = 0): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.numMult.index,
            key, args: { value, defaultValue }
        }) as Promise<number>;
    }

    numDiv(key: string, value: number, defaultValue: number = 0): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.numDiv.index,
            key, args: { value, defaultValue }
        }) as Promise<number>;
    }

    setGetMembers(key: string): Promise<Set<(number|string)>|undefined> {
        return processRequest(this, {
            commandIndex: commandsDict.setGetMembers.index,
            key
        }) as Promise<Set<(number|string)>|undefined>;
    }

    setAddMembers(key: string, members: (number|string)[]): Promise<void> {
        return processRequest(this, {
            commandIndex: commandsDict.setAddMembers.index,
            key, args: { members }
        }) as Promise<void>;
    }

    setRemoveMembers(key: string, members: (number|string)[]): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.setRemoveMembers.index,
            key, args: { members }
        }) as Promise<number>;
    }

    setGetMemberCount(key: string): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.setGetMemberCount.index,
            key
        }) as Promise<number>;
    }

    setHasMembers(key: string, members: (number|string)[]): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.setHasMembers.index,
            key, args: { members }
        }) as Promise<number>;
    }

    mapGetKeys(key: string): Promise<string[]|undefined> {
        return processRequest(this, {
            commandIndex: commandsDict.mapGetKeys.index,
            key
        }) as Promise<string[]>;
    }

    mapGetValues(key: string, keys: string[]): Promise<any[]> {
        return processRequest(this, {
            commandIndex: commandsDict.mapGetValues.index,
            key, args: { keys }
        }) as Promise<any[]>;
    }

    mapGetFields(key: string): Promise<Map<string, any>|undefined> {
        return processRequest(this, {
            commandIndex: commandsDict.mapGetFields.index,
            key
        }) as Promise<Map<string, any>>;
    }

    mapAddFields(key: string, fields: [string, any][]): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.mapAddFields.index,
            key, args: { fields }
        }) as Promise<number>;
    }

    mapRemoveKeys(key: string, keys: string[]): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.mapRemoveKeys.index,
            key, args: { keys }
        }) as Promise<number>;
    }

    mapGetCount(key: string): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.mapGetCount.index,
            key
        }) as Promise<number>;
    }

    mapHasKeys(key: string, keys: string[]): Promise<number> {
        return processRequest(this, {
            commandIndex: commandsDict.mapHasKeys.index,
            key, args: { keys }
        }) as Promise<number>;
    }

    async scan({ limit = 1000, filter, resumeKey, resumeCb }: ScanOptions = {}): Promise<ScanResult> {
        const handler = (resumeKey?: string) => {
            return processRequest(this, {
                commandIndex: commandsDict.scan.index,
                workerOrPort: !resumeKey ? this.workerPorts[0] : undefined, // only use first worker if no resume key
                resumeKey,
                args: {
                    limit: Math.max(10, Math.min(limit, 10000)),
                    resumeKey,
                    filterExp: filter instanceof RegExp && filter,
                    filterFn: filter instanceof RAMFunction && filter.id
                }
            });
        };

        let lastResult: ScanResult;
        let allKeys: string[] = [];
        do {
            lastResult = await handler(resumeKey) as ScanResult;
            allKeys = allKeys.concat(lastResult.keys);
            resumeKey = lastResult.resumeKey;
        } while (resumeCb && lastResult.resumeKey && await resumeCb(lastResult));

        return { keys: allKeys, resumeKey: lastResult.resumeKey };
    }

    scanSplit(resumeKeySplits: number): string[] {
        resumeKeySplits = Math.max(1, Math.min(resumeKeySplits, this.shardCount));
        const shardsPerResumeKey = Math.ceil(this.shardCount / resumeKeySplits); // evenly split shards across resume keys

        const resumeKeys: string[] = [];

        let currentShard = 0;
        while (currentShard < this.shardCount) {
            const maxShardIndex = Math.min(currentShard + shardsPerResumeKey, this.shardCount);
            const workerIndex = Math.floor(currentShard / this.shardsPerWorker);
            resumeKeys.push(`${workerIndex}:${currentShard % this.shardsPerWorker}::${maxShardIndex}`);
            currentShard = maxShardIndex + 1;
        }

        return resumeKeys;
    }
}
