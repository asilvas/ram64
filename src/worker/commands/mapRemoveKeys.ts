import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';
import { fn as set } from './set';

export const fn: CommandFn = (opts: CommandOptions): number => {
    const oldValue = get(opts);
    const useDefault = !(oldValue instanceof Map);
    const value = !useDefault ? oldValue : new Map();

    let ret = 0;
    for (let v of opts.args?.keys ?? []) {
        value.delete(v) && ret++;
    }

    // only update map if we had to use default
    useDefault && set({ ...opts, args: { value }});

    return ret;
}
