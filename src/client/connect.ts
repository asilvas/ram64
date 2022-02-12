import { MessagePort, parentPort, isMainThread } from "worker_threads";
import { MessageToMain, MessageFromMain } from '../types';
import { RAM64 } from ".";
import { randomString } from '../util/rand';

export async function connect(connectKey: string): Promise<RAM64> {
    if (isMainThread) return Promise.reject(new Error('connect() must be called from a worker thread. Use startup() instead.'));

    const req: MessageToMain = {
        ram64: true,
        requestId: randomString(),
        command: 'connect',
        args: {
            connectKey
        }
    };

    // TODO: support for timeout probably isn't a terrible idea

    const promise = new Promise((resolve, reject) => {
        const handler = (res: MessageFromMain) => {
            if (res?.requestId !== req.requestId) return; // ignore unintended responses

            parentPort?.off('message', handler); // remove handler

            if (res.error) return void reject(res.error);

            resolve(res.value);
        };

        parentPort?.on('message', handler);
        parentPort?.postMessage(req);
    });

    const ports: MessagePort[] = await promise as MessagePort[];

    // drop refs
    ports.forEach(ports => ports.unref());

    return new RAM64({ connectKey, ports });
}
