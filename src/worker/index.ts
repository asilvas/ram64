import { parentPort, MessagePort } from 'worker_threads';
import { processRequest } from './process-request';
import { init as initCommands } from './commands';
import { MessageToWorker } from '../types';

if (parentPort) {
    initCommands().then(() => {
        const parent = parentPort as MessagePort;

        parent.on('message', msg => processRequest(parentPort as MessagePort, msg as MessageToWorker));
        parent.postMessage({ ram64: true, ready: true });
    });
} else {
    throw new Error('No parent port');
}
