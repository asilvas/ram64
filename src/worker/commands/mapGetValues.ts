import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';

export const fn: CommandFn = (opts: CommandOptions): any[] => {
    const oldValue = get(opts);
    const useDefault = !(oldValue instanceof Map);
    const value = !useDefault ? oldValue : new Map();

    const ret = [];
    for (let v of opts.args?.keys ?? []) {
        ret.push(value.get(v));
    }

    return ret;
}
