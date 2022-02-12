import { MessageChannel, Worker } from 'worker_threads';
import { RAM64 } from '.';
import { processResponse } from './process-response';
import { MessageToMain, MessageFromMain, MessageFromWorker } from '../types';
import { commandsDict } from '../commands';
import { processRequest, Request } from './process-request';
import { isRAM64Message } from './is-ram64-message';

export function processServerRequest(instance: RAM64, worker: Worker, msg: MessageToMain): void {
    if (!isRAM64Message(msg)) {
        return; // ignore non-RAM64 messages
    }

    const { command, requestId, args } = msg;
    switch (command) {
        case 'connect':
            if (args?.connectKey !== instance.connectKey) {
                return void worker.postMessage({ ram64: true, requestId, error: 'Valid `connectKey` is required' } as MessageFromMain);
            }

            const workerPorts = instance.workerPorts.map(worker => {
                const { port1, port2 } = new MessageChannel(); // create bidirectional link between worker and calling thread

                // no requestId, blind fire-and-forget
                const req: Request = {
                    workerOrPort: worker,
                    commandIndex: commandsDict.connect.index,
                    args: { port: port1 }
                }
                port1.on('message', (msg: MessageFromWorker) => processResponse(msg));
                port1.unref();

                processRequest(instance, req, [port1]);

                // TODO: handle 'close' event (may not be necessary since we don't track reference)

                return port2;
            });
            const response: MessageFromMain = { ram64: true, requestId, value: workerPorts };

            worker.postMessage(response, [...workerPorts]); // transfer ports to worker
            break;
        default:
            Promise.reject(new Error(`Server command '${command}' not implemented`));
            break;
    }
}
