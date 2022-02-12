import { commands as commandsArr, commandsDict, Command, CommandFn } from '../../commands';

export const commands: Command[] = commandsArr;

function wireupCommand(commandName: string, commandFn: CommandFn) {
    const cmd = commandsDict[commandName];
    if (!cmd) throw new Error(`Command "${commandName}" not found`);

    commandsArr[cmd.index].fn = commandFn;
}

export async function init() {
    for (let cmd of commands) {
        const { fn } = await import(`./${cmd.name}`);
        wireupCommand(cmd.name as string, fn);
    }
}
