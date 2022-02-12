import { startup } from '../../src';

export function setup() {
    return startup({ threadCount: 2 });
}

export function teardown() {
    return instance.shutdown();
}
