import farmhash from 'farmhash';

export const HASH_SEED: number = 0x1234;

export function getHash(key: string): number {
    return farmhash.hash32WithSeed(key, HASH_SEED);
}
