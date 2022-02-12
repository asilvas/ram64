import { CommandFn, CommandOptions } from '../../commands';
import { set } from '../functions';

export const fn: CommandFn = (opts: CommandOptions): void => {
    set(opts.args?.fnCode);
}
