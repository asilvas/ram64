import { Worker, MessagePort, TransferListItem } from 'worker_threads';
import { RAM64 } from "./";
import { MessageToMain, MessageToWorker } from '../types'
import { getHash } from '../util/hash';
import { randomString } from '../util/rand';
import { isRAM64Message } from './is-ram64-message';

export type PendingRequest = {
    requestId?: string;
    resolve(value: any): void;
    reject(reason?: any): void;
}

export const REQUESTS_PENDING: Map<string, PendingRequest> = new Map();

export type Request = {
    commandIndex: number;
    workerOrPort?: Worker|MessagePort;
    key?: string;
    resumeKey?: string;
    keys?: Array<string>;
    args?: any;    
}

export async function processRequest(instance: RAM64, req: Request|MessageToMain, transferList?: TransferListItem[]): Promise<any> {
    if (!('commandIndex' in req)) {
        return; // ignore, not for us
    }

    let { workerOrPort, key, resumeKey, keys, commandIndex, args }: Request = req as Request;

    if (!workerOrPort && !key && !resumeKey) { // if no worker or key are specified, then we're dealing with a broadcast
        if (keys) {
            return Promise.all(keys.map(key => processRequest(instance, { key, commandIndex, args })));
        } else {
            return Promise.all(instance.workerPorts.map(workerOrPort => processRequest(instance, { workerOrPort, commandIndex, args })));
        }
    }

    if (!workerOrPort && key !== undefined) {
        workerOrPort = instance.getPortFromHash(getHash(key));
    } else if (!workerOrPort && resumeKey !== undefined) {
        workerOrPort = instance.workerPorts[Number(resumeKey.split(':')[0])];
    }
    if (!workerOrPort) throw new Error(`Port not found from '${key || resumeKey}'`);

    const requestId = randomString();

    const reqPromise = new Promise((resolve, reject) => {
        REQUESTS_PENDING.set(requestId, { requestId, resolve, reject });
    });

    const res: MessageToWorker = { ram64: true, key, commandIndex, requestId, args };

    workerOrPort.postMessage(res, transferList);

    return reqPromise;
}
