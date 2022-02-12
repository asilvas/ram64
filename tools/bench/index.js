const { startup, isRAM64Message } = require('../../');
const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs/promises');

(async () => {
    
    const tests = [

        { concurrency: 1, cacheThreads: 1, clientThreads: 1 },
        { concurrency: 4, cacheThreads: 4, clientThreads: 1 },
        { concurrency: 8, cacheThreads: 8, clientThreads: 1 },
        { concurrency: 16, cacheThreads: 16, clientThreads: 1 },
        { concurrency: 32, cacheThreads: 32, clientThreads: 1 },
        { concurrency: 1, cacheThreads: 1, clientThreads: 4 },
        { concurrency: 4, cacheThreads: 4, clientThreads: 4 },
        { concurrency: 8, cacheThreads: 8, clientThreads: 4 },
        { concurrency: 16, cacheThreads: 16, clientThreads: 4 },
        { concurrency: 32, cacheThreads: 32, clientThreads: 4 },
        { concurrency: 1, cacheThreads: 1, clientThreads: 8 },
        { concurrency: 4, cacheThreads: 4, clientThreads: 8 },
        { concurrency: 8, cacheThreads: 8, clientThreads: 8 },
        { concurrency: 16, cacheThreads: 16, clientThreads: 8 },
        { concurrency: 32, cacheThreads: 32, clientThreads: 8 },
        { concurrency: 1, cacheThreads: 1, clientThreads: 16 },
        { concurrency: 4, cacheThreads: 4, clientThreads: 16 },
        { concurrency: 8, cacheThreads: 8, clientThreads: 16 },
        { concurrency: 16, cacheThreads: 16, clientThreads: 16 },
        { concurrency: 32, cacheThreads: 32, clientThreads: 16 },
        { concurrency: 1, cacheThreads: 1, clientThreads: 32 },
        { concurrency: 4, cacheThreads: 4, clientThreads: 32 },
        { concurrency: 8, cacheThreads: 8, clientThreads: 32 },
        { concurrency: 16, cacheThreads: 16, clientThreads: 32 },
        { concurrency: 32, cacheThreads: 32, clientThreads: 32 },
        { concurrency: 64, cacheThreads: 64, clientThreads: 32 },
        { concurrency: 64, cacheThreads: 64, clientThreads: 64 }, // 1.22M
        { concurrency: 64*2, cacheThreads: 64, clientThreads: 64 }, // 1.1M
        { concurrency: 64, cacheThreads: 64*2, clientThreads: 64 }, // 1.28M
        { concurrency: 64, cacheThreads: 64, clientThreads: 64*2 }, // 1.44M
        { concurrency: 64, cacheThreads: 64*2, clientThreads: 64*2 }, // 1.56M
        { concurrency: 64, cacheThreads: 64*3, clientThreads: 64*3 }, // 1.73M
        { concurrency: 64, cacheThreads: 64*4, clientThreads: 64*4 }, // 2.23M
        //{ concurrency: 64, cacheThreads: 64, clientThreads: 64*10 }, // 2.1M

        { concurrency: 1, clientThreads: 1, redis: true },
        { concurrency: 4, clientThreads: 4, redis: true },
        { concurrency: 8, clientThreads: 8, redis: true },
        { concurrency: 16, clientThreads: 16, redis: true },
        { concurrency: 32, clientThreads: 32, redis: true },
        { concurrency: 64, clientThreads: 64, redis: true },

    ];

    const results = [];
    for (let test of tests) {
        const result = await bench(test);
        results.push(result);
    }

    await fs.writeFile('./tools/bench/results.json', JSON.stringify(results, null, 2));

})();

async function bench(opts = {}) {
    const { cacheThreads = 1, clientThreads = 1 } = opts;

    const ram64 = await startup({ threadCount: cacheThreads });

    const workerData = {
        connectKey: ram64.connectKey,
        options: opts
    };

    const results = await Promise.all(Array.from({ length: clientThreads }).map((v, i) => {
        return new Promise((resolve, reject) => {
            const worker = new Worker(path.join(__dirname, './worker.js'), { workerData });
            ram64.registerWorker(worker);
            worker.on('message', async result => {
                if (isRAM64Message(result)) return; // ignore

                await worker.terminate();
                resolve(result);
            });
            worker.on('error', reject);
        });
    }));

    //await ram64.save('./tools/bench/save/');
    await ram64.shutdown();

    const mergedResults = results.reduce((acc, { benchResults }) => {
        if (!acc.name) acc.name = benchResults.name;
        if (!acc.options) acc.options = benchResults.options;

        for (let key in benchResults) {
            if (key === 'name' || key === 'options') continue;

            if (!acc[key]) {
                acc[key] = benchResults[key];
                acc[key].count = 1;
            } else {
                acc[key].duration += benchResults[key].duration;
                acc[key].rate += benchResults[key].rate;
                acc[key].latency += benchResults[key].latency;
                acc[key].count++;
            }
        }

        return acc;
    }, {});

    for (let key in mergedResults) {
        if (key === 'name' || key === 'options') continue;

        mergedResults[key].duration /= mergedResults[key].count;
        mergedResults[key].latency /= mergedResults[key].count;
    }

    console.log(JSON.stringify(mergedResults, null, 2));

    return mergedResults;
}
