const process = require('process');

const SHARDS = 1000000;
const maps = Array.from({ length: SHARDS }, (_, i) => new Map());

let state = {
    start: Date.now(),
    op: 0
};

function displayStats() {
    const elapsed = Date.now() - state.start;
    const gOps = (state.op / elapsed) / 1000;
    const memUsage = 0;//(process?.memoryUsage()?.heapUsed || 0) / 1024 / 1024 / 1024;
    const keys = maps.reduce((acc, map) => acc + map.size, 0) / 1000 / 1000;

    console.log(`${gOps.toFixed(2)} GOps/sec, ${memUsage.toFixed(2)}GB, ${keys.toFixed(2)}M/keys`);

    state.start = Date.now();
    state.op = 0;
}

(async () => {
    while (true) {
        for (let map of maps) {
            map.set(Math.random(), `${Math.random()}:${Math.random()}`);
        }
        state.op += SHARDS;
    
        displayStats();
    }    
})();
