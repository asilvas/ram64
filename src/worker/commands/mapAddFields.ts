import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';
import { fn as set } from './set';

export const fn: CommandFn = (opts: CommandOptions): void => {
    const oldValue = get(opts);
    const useDefault = !(oldValue instanceof Map);
    const value = !useDefault ? oldValue : new Map();

    for (let [k, v] of opts.args?.fields ?? []) {
        value.set(k, v);
    }

    // only update map if we had to use default
    useDefault && set({ ...opts, args: { value }});
}
