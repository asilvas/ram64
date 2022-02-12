import { MessagePort } from 'worker_threads';
import { CommandFn, CommandOptions } from '../../commands';
import { processRequest } from '../process-request';
import { MessageToWorker } from '../../types';

export const fn: CommandFn = (opts: CommandOptions): boolean => {
    const { port } = opts.args;
    port.unref();
    port.on('message', msg => processRequest(port as MessagePort, msg as MessageToWorker));
    return true;
}
