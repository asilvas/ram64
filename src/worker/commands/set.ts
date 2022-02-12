import { CommandFn, CommandOptions } from '../../commands';
import { fn as setWithOptions } from './setWithOptions';

export const fn: CommandFn = (opts: CommandOptions): void => {
    setWithOptions({ ...opts, args: { value: opts.args?.value }});
}
