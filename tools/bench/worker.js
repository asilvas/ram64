const { workerData, parentPort } = require('worker_threads');
const { connect } = require('../../');
const pLimit = require('p-limit');
const { createClient } = require('redis');

const OPERATIONS = 100000;

const OPS = [
    {
        name: 'set',
        fn: (client, i) => client.set(i.toString(), Math.random()),
        redisFn: (client, i) => client.set(i.toString(), Math.random())
    },
    {
        name: 'get',
        fn: (client, i) => client.get(i.toString()),
        redisFn: (client, i) => client.get(i.toString())
    },
    {
        name: 'del',
        fn: (client, i) => client.del(i.toString()),
        redisFn: (client, i) => client.del(i.toString())
    }
];

(async () => {
    const ram64 = await connect(workerData.connectKey);

    const benchResults = await bench(ram64, workerData.options);

    parentPort.postMessage({ benchResults });
})();

async function bench(ram64, options) {
    const { concurrency = 1, cacheThreads = 1, clientThreads = 1, redis = false } = options;

    const redisLabel = options.redis ? ',redis:true' : '';
    const name = `concurrency:${concurrency},cacheThreads:${cacheThreads},clientThreads:${clientThreads}${redisLabel}`;

    const results = { name, options };

    for (let op of OPS) {
        results[`${redis ? 'redis' : 'ram64'}.${op.name}`] = await BenchOp(ram64, op, options);
    }

    return results;
}

async function BenchOp(ram64, op, { concurrency, redis }) {
    let redisClient;
    if (redis) {
        redisClient = createClient();
        await redisClient.connect();
        await redisClient.flushAll();
    }
    const limit = pLimit(concurrency);
    const promises = [];
    for (let i = 0; i < OPERATIONS; i++) {
        promises.push(limit(() => redis ? op.redisFn(redisClient, i) : op.fn(ram64, i)));
    }
    const start = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - start;

    if (redis) {
        await redisClient.flushAll();
        redisClient.disconnect();
    }

    return {
        name: op.name,
        duration,
        rate: (OPERATIONS / (duration / 1000)),
        latency: (1000 / (OPERATIONS / (duration / 1000)))
    }
}
