import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';

export const fn: CommandFn = (opts: CommandOptions): number => {
    const oldValue = get(opts);
    const oldStr = typeof oldValue === 'string' ? oldValue : '';

    return oldStr.length;
}
