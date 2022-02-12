import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';

export const fn: CommandFn = (opts: CommandOptions): Set<any>|undefined => {
    const oldValue = get(opts);
    const oldSet = oldValue instanceof Set ? oldValue : new Set();

    return oldValue === undefined ? undefined : oldSet;
}
