import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';
import { fn as set } from './set';

export const fn: CommandFn = (opts: CommandOptions): number => {
    const oldValue = get(opts);
    const oldNum = typeof oldValue === 'number' ? oldValue : opts.args?.defaultValue ?? 0;

    const value = oldNum - opts.args?.value ?? 0;
    set({ ...opts, args: { value }});

    return value;
}
