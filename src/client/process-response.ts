import { REQUESTS_PENDING, PendingRequest } from './process-request';
// TODO: ^ might need to be moved into client instance to avoid cross-instance conflicts, but should be fine for now
import { MessageFromWorker } from '../types';

export function processResponse(msg: MessageFromWorker): void {
    const { requestId, value, error } = msg;

    const req: PendingRequest|undefined = requestId ? REQUESTS_PENDING.get(requestId) : undefined;
    if (!req) {
        return;
    }
    REQUESTS_PENDING.delete(requestId as string);

    if (error) return void req.reject(error);

    req.resolve(value);
}
