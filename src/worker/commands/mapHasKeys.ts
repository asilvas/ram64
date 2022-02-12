import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';

export const fn: CommandFn = (opts: CommandOptions): number => {
    const oldValue = get(opts);
    const useDefault = !(oldValue instanceof Map);
    const value = !useDefault ? oldValue : new Map();

    let ret = 0;
    for (let v of opts.args?.keys ?? []) {
        value.has(v) && ret++;
    }

    return ret;
}
