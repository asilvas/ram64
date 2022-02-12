import { CommandFn, CommandOptions } from '../../commands';
import { fn as get } from './get';
import { fn as set } from './set';

export const fn: CommandFn = (opts: CommandOptions): any => {
    const oldValue = get(opts);
    const oldValueClone = oldValue ? JSON.parse(JSON.stringify(oldValue)) : void 0;

    set(opts); // set the value

    return oldValueClone; // return clone of old value to avoid mutations
}
