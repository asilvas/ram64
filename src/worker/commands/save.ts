import { CommandFn, CommandOptions } from '../../commands';
import { Shards } from '../shards';
import { writeFile } from 'fs/promises';

export const fn: CommandFn = async (opts: CommandOptions): Promise<void> => {
    const { dirPath } = opts.args;

    for (let shard of Shards) {
        const filePath = `${dirPath}/shard${shard.shardIndex}.json`;
        const arr = [...shard.map];
        const json = JSON.stringify(arr, replacer);
        await writeFile(filePath, json);
    }
}

function replacer(key: string, value: any): any {
    if (value instanceof Map) {
        return {
            $map: [...value]
        };
    } else if (value instanceof Set) {
        return {
            $set: [...value]
        };
    } else {
        return value;
    }
}
