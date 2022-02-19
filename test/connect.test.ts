import { Worker } from 'worker_threads';
import { startup, connect, RAM64, isRAM64Message } from '../src';

let instance: RAM64;

beforeAll(async () => {
    instance = await startup({ threadCount: 2 });
});

afterAll(async () => {
    await instance.shutdown();
});

describe('connect', () => {

    it('spawn worker', () => {
        return new Promise((resolve, reject) => {
            const worker = instance.spawnWorker('./test/connect-worker.js', {}, {
                onMessage: (msg: any) => {
                    if (msg === true) {
                        resolve(msg);
                        worker.terminate();
                    }
                }
            });
            worker.on('error', reject);
            worker.on('messageerror', reject);
        });
    });

    it('can connect from registered worker', () => {
        return new Promise((resolve, reject) => {
            const worker = new Worker('./test/connect-worker.js', { workerData: { connectKey: instance.connectKey } });
            instance.registerWorker(worker, {
                onMessage: (msg: any) => {
                    if (msg === true) {
                        resolve(msg);
                        worker.terminate();
                    }
                }
            });
            worker.on('error', reject);
            worker.on('messageerror', reject);
        });
    });

    it('can connect and do simple op from registered worker', () => {
        return new Promise((resolve, reject) => {
            const worker = new Worker('./test/connect-worker.js', { workerData: { connectKey: instance.connectKey, set: true } });
            instance.registerWorker(worker, {
                onMessage: (msg: any) => {
                    if (msg === true) {
                        resolve(msg);
                        worker.terminate();
                    }
                }
            });
            worker.on('error', reject);
            worker.on('messageerror', reject);
        });
    });

    it('graceful failure if invalid connectKey', async () => {
        await expect(new Promise((resolve, reject) => {
            const worker = new Worker('./test/connect-worker.js', { workerData: { connectKey: 'gg' } });
            instance.registerWorker(worker, {
                onMessage: (msg: any) => {
                    if (msg === true) {
                        resolve(msg);
                        worker.terminate();
                    } else if ('error' in msg) {
                        reject(new Error(msg.error));
                        worker.terminate();
                    }
                }
            });
            worker.on('error', reject);
            worker.on('messageerror', reject);
        })).rejects.toThrow();
    });

    it('failure attempting to connect from main thread', async () => {
        await expect(connect('gg')).rejects.toThrow();
    });
});
