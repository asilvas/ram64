import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';

export const fn: CommandFn = (opts: CommandOptions): string[]|undefined => {
    const oldValue = get(opts);
    const oldMap = oldValue instanceof Map ? oldValue : new Map();

    return oldValue === undefined ? undefined : [...oldMap.keys()];
}
