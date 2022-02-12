import { MessagePort } from 'worker_threads';
import { Shard, MessageFromWorker, MessageToWorker } from "../types";
import { commands } from './commands';
import { Command } from '../commands';
import { getShardFromKey } from './get-shard';
import { isRAM64Message } from '../client/is-ram64-message';
import { isLRUEnabled, evict } from './lru';

let msgSinceEvict = 0;

export async function processRequest(port: MessagePort, req: MessageToWorker): Promise<void> {
    if (!isRAM64Message(req)) return;
    const { key, commandIndex, requestId, args }: MessageToWorker = req;

    const cmd: Command = commands[commandIndex ?? -1];

    if (!cmd?.fn) return void port.postMessage({ ram64: true, requestId, error: `Command '${commandIndex}' not implemented` });

    let shard: Shard|undefined, value: any, error: any;

    if (key) {
        shard = getShardFromKey(key);
    }

    if (cmd.promise) {
        value = await cmd.fn({ shard, key, args }).catch((err: any) => {
            error = err;
        });
    } else {
        try {
            value = cmd.fn({ shard, key, args });
        } catch (err) {
            error = err;
        }
    }

    const response: MessageFromWorker = { ram64: true, requestId, value, error };

    port.postMessage(response);

    if (isLRUEnabled) {
        msgSinceEvict++;

        if (msgSinceEvict > 100) { // periodic checks
            msgSinceEvict = 0;

            evict();
        }
    }
}
