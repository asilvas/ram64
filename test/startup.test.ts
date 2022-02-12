import { startup } from '../src';

describe('startup', () => {

    it.concurrent('using defaults', async () => {
        const tmp = await startup();
        await tmp.shutdown();
    });

    it.concurrent('single thread', async () => {
        const tmp = await startup({ threadCount: 1 });
        await tmp.shutdown();
    });

    it.concurrent('many threads', async () => {
        const tmp = await startup({ threadCount: 99 });
        await tmp.shutdown();
    });
});
