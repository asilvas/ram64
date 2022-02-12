import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';
import { fn as set } from './set';

export const fn: CommandFn = (opts: CommandOptions): void => {
    const oldValue = get(opts);
    const useDefault = !(oldValue instanceof Set);
    const value = !useDefault ? oldValue : new Set();

    for (let v of opts.args?.members ?? []) {
        value.add(v);
    }

    // only update map if we had to use default
    useDefault && set({ ...opts, args: { value }});
}
