import { Shard } from './types';

let commandIndex = 0;

export type CommandOptions = {
    shard?: Shard;
    key?: string;
    keyHash?: number;
    args?: any;
}

export type CommandFn = (options: CommandOptions) => any;

export type Command = {
    index: number;
    name?: string;
    private?: boolean;
    promise?: boolean;
    fn?: CommandFn;
}

export type Commands = {
    [key: string]: Command;
}

export const commandsDict: Commands = {
    // private
    'connect': { index: commandIndex++, private: true },
    'ping': { index: commandIndex++ },
    // public
    // functions
    'save': { index: commandIndex++, promise: true },
    'load': { index: commandIndex++, promise: true },
    'registerFunction': { index: commandIndex++ },
    // reads
    'exists': { index: commandIndex++ },
    'get': { index: commandIndex++ },
    'getSet': { index: commandIndex++ },
    'getWithOptions': { index: commandIndex++ },
    'scan': { index: commandIndex++ },
    // writes
    'touch': { index: commandIndex++ },
    'set': { index: commandIndex++ },
    'setIfValue': { index: commandIndex++ },
    'setFn': { index: commandIndex++ },
    'setOptions': { index: commandIndex++ },
    'setWithOptions': { index: commandIndex++ },
    'insert': { index: commandIndex++ },
    // deletes
    'del': { index: commandIndex++ },
    'deleteAll': { index: commandIndex++ },
    // strings
    'strAppend': { index: commandIndex++ },
    'strPrepend': { index: commandIndex++ },
    'strLength': { index: commandIndex++ },
    'strSetRange': { index: commandIndex++ },
    'strGetRange': { index: commandIndex++ },
    'strReplace': { index: commandIndex++ },
    // numbers
    'numAdd': { index: commandIndex++ },
    'numSub': { index: commandIndex++ },
    'numMult': { index: commandIndex++ },
    'numDiv': { index: commandIndex++ },
    // sets
    'setGetMembers': { index: commandIndex++ },
    'setAddMembers': { index: commandIndex++ },
    'setRemoveMembers': { index: commandIndex++ },
    'setGetMemberCount': { index: commandIndex++ },
    'setHasMembers': { index: commandIndex++ },
    // maps
    'mapGetKeys': { index: commandIndex++ },
    'mapGetValues': { index: commandIndex++ },
    'mapGetFields': { index: commandIndex++ },
    'mapAddFields': { index: commandIndex++ },
    'mapRemoveKeys': { index: commandIndex++ },
    'mapGetCount': { index: commandIndex++ },
    'mapHasKeys': { index: commandIndex++ },
}

// sort not required since order is preserved
export const commands: Array<Command> = Object.entries(commandsDict).map(([name, command]) => ({ name, ...command }));
