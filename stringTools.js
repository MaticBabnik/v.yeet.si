module.exports = {
    padLeft(string, length) {
        return (' '.repeat(length) + string).slice(-length)
    },
    padCenter(string, length) {
        const pad = Math.max(length - string.length, 0);
        return ' '.repeat(Math.floor(pad / 2)) + string + ' '.repeat(Math.round(pad / 2));
    },
    padRight(string, length) {
        return (string + ' '.repeat(length)).substring(0, length);
    },
}