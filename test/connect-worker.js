const { workerData, parentPort } = require('worker_threads');
const { connect } = require('../lib');

connect(workerData.connectKey).then(async instance => {
    if (workerData.set) {
        await instance.set(Math.random().toString(), Math.random());
    }
    parentPort?.postMessage(true);
}).catch(error => {
    parentPort?.postMessage({ error });
});
