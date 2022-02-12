export function randomString(): string {
    // https://stackoverflow.com/a/12502559/130723
    return Math.random().toString(36).slice(2);
}
