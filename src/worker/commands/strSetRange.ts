import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';
import { fn as set } from './set';

export const fn: CommandFn = (opts: CommandOptions): string => {
    const oldValue = get(opts);
    const oldStr = typeof oldValue === 'string' ? oldValue : '';

    const firstPart = oldStr.substring(0, opts.args?.offset ?? 0);
    const secondPart = oldStr.substring(opts.args?.offset ?? 0);
    const value = firstPart + (opts.args?.value ?? '') + secondPart;
    set({ ...opts, args: { value }});

    return value;
}
