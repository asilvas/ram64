import { CommandFn, CommandOptions } from '../../commands';
import { Shards } from '../shards';
import { readFile } from 'fs/promises';

export const fn: CommandFn = async (opts: CommandOptions): Promise<void> => {
    const { dirPath } = opts.args;

    for (let shard of Shards) {
        const filePath = `${dirPath}/shard${shard.shardIndex}.json`;
        const json: string = await readFile(filePath, 'utf8');
        const arr = JSON.parse(json, reviver);

        for (let [key, value] of arr) {
            shard.map.set(key, value);
        }
    }
}

function reviver(key: string, value: any): any {
    if (Array.isArray(value?.$map)) return new Map(value.$map);
    else if (Array.isArray(value?.$set)) return new Set(value.$set);
    else return value;
}
