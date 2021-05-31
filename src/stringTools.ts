export function padLeft(string: String, length: number): string {
    return (' '.repeat(length) + string).slice(-length);
}
export function padCenter(string: String, length: number): string {
    const pad = Math.max(length - string.length, 0);
    return ' '.repeat(Math.floor(pad / 2)) + string + ' '.repeat(Math.round(pad / 2));
}
export function padRight(string: String, length: number): string {
    return (string + ' '.repeat(length)).substring(0, length);
}