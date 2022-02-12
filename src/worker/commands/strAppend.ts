import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';
import { fn as set } from './set';

export const fn: CommandFn = (opts: CommandOptions): string => {
    const oldValue = get(opts);
    const oldStr = typeof oldValue === 'string' ? oldValue : '';

    const value = oldStr + opts.args?.value;
    set({ ...opts, args: { value }});

    return value;
}
