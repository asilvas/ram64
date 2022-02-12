import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';
import { fn as set } from './set';

export const fn: CommandFn = (opts: CommandOptions): boolean => {
    const value = get(opts);
    if (value !== opts.args?.expectedValue) return false;

    set(opts);

    return true;
}
