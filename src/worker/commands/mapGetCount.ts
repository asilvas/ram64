import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';

export const fn: CommandFn = (opts: CommandOptions): number => {
    const oldValue = get(opts);
    const useDefault = !(oldValue instanceof Map);
    const value = !useDefault ? oldValue : new Map();

    return value.size;
}
