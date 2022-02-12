import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';

export const fn: CommandFn = (opts: CommandOptions): string => {
    const oldValue = get(opts);
    const oldStr = typeof oldValue === 'string' ? oldValue : '';

    const value = oldStr.substring(opts.args?.start ?? 0, opts.args?.end ?? 0);

    return value;
}
