export class TermBuf {

    private buffer: tchar[][] | any;
    public h: number
    public w: number;

    constructor(w: number, h: number) {
        this.w = w;
        this.h = h;
        this.buffer = [... new Array(h).keys()]
            .map(() => [... new Array(w).keys()]
                .map(() => ({
                    char: ' ',
                    attr: DEFAULT_ATTR
                })
                )
            );
    }

    public getchar(x: number, y: number): tchar {
        return this.buffer[y][x];
    }
    public setchar(x: number, y: number, val: string): void;
    public setchar(x: number, y: number, val: tchar): void;
    public setchar(x: number, y: number, val: any): void {
        if (typeof (val) === 'string') {
            this.buffer[y][x] = { char: val, attr: this.getchar(x, y).attr };

        } else
            this.buffer[y][x] = val;
    }

    public drawTable(rows: number[], columns: number[], boldFrame: boolean, boldFirst: boolean, attributes?: attr): TermBuf {
        const attr: attr = attributes ?? { back: Color.Black, fore: Color.White, bold: false, strike: false };

        //convert rows and column widths into absolute coords
        let cx = 0, cy = 0;

        rows = [0, ...rows.map(x => cx += x + 1)]
        columns = [0, ...columns.map(y => cy += y + 1)]

        for (let c of columns) {
            for (let a = 0; a <= cx; a++) {
                this.setchar(a, c, {char: chars.line.horizontal[
                    (((c == 0 || c == columns[columns.length - 1]) && boldFrame) || (c == columns[1] && boldFirst)) ?
                        'bold' : 'thin'],attr});
            }
        }

        const crossings = [];
        for (let r of rows) {
            for (let a = 0; a <= cy; a++) {
                if (columns.includes(a)) { //crossings
                    if ((r == 0 || r == cx) && (a == 0 || a == cy)) {
                        this.setchar(r, a,{char: chars.corners[Math.min(r, 1)][Math.min(a, 1)][boldFrame ? 'bold' : 'thin'], attr});
                    } else {
                        crossings.push([r, a]);
                    }

                } else
                    this.setchar(r, a, {char: chars.line.vertical[
                        (((r == 0 || r == rows[rows.length - 1]) && boldFrame) || (r == rows[1] && boldFirst)) ?
                            'bold' : 'thin'],attr});
            }
        }

        for (let [x, y] of crossings) {
            this.setchar(x, y,{char:  cross(this, x, y, cx, cy),attr})
        }

        return this;
    }

    public toString(): string {

        let string = "";

        for (let line of this.buffer) {
            let curBack = Color.Black, curFore = Color.White
            let strike = false, bold = false;

            for (let char of line) {

                let escape = [];

                if (char.attr.back != curBack)
                    escape.push(char.attr.back + BACK_OFFSET)
                if (char.attr.fore != curFore)
                    escape.push(char.attr.fore + FORE_OFFSET)
                if (char.attr.strike != strike)
                    escape.push(char.attr.strike ? 0 : 9);
                if (char.attr.bold != bold)
                    escape.push(char.attr.bold ? 0 : 1);

                if (escape.length != 0)
                    string += `\x1b[${escape.sort().join(';')}m`;

                string += char.char;


            }
            string += "\x1b[0m\n"; //reset style & newline


        }
        return string
    }
}


const chars = {
    line: { vertical: { thin: '│', bold: '┃' }, horizontal: { thin: '─', bold: '━' } },
    corners: [
        [{ thin: '┌', bold: '┏' }, { thin: '└', bold: '┗' }],
        [{ thin: '┐', bold: '┓' }, { thin: '┘', bold: '┛' }]
    ],
    crossings: {
        0: {
            0: {
                0: { 0: ' ', 1: '╶', 2: '╺', },
                1: { 0: '╴', 1: '─', 2: '╼', },
                2: { 0: '╸', 1: '╾', 2: '━', },
            },
            1: {
                0: { 0: '╷', 1: '┌', 2: '┍', },
                1: { 0: '┐', 1: '┬', 2: '┮', },
                2: { 0: '┑', 1: '┭', 2: '┯', },
            },
            2: {
                0: { 0: '╻', 1: '┎', 2: '┏', },
                1: { 0: '┒', 1: '┰', 2: '┲', },
                2: { 0: '┓', 1: '┱', 2: '┳', },
            },
        },
        1: {
            0: {
                0: { 0: '╵', 1: '└', 2: '┕', },
                1: { 0: '┘', 1: '┴', 2: '┶', },
                2: { 0: '┙', 1: '┵', 2: '┷', },
            },
            1: {
                0: { 0: '│', 1: '├', 2: '┝', },
                1: { 0: '┤', 1: '┼', 2: '┾', },
                2: { 0: '┥', 1: '┽', 2: '┿', },
            },
            2: {
                0: { 0: '╽', 1: '┟', 2: '┢', },
                1: { 0: '┧', 1: '╁', 2: '╊', },
                2: { 0: '┪', 1: '╅', 2: '╈', },
            },
        },
        2: {
            0: {
                0: { 0: '╹', 1: '┖', 2: '┗', },
                1: { 0: '┚', 1: '┸', 2: '┺', },
                2: { 0: '┛', 1: '┹', 2: '┻', },
            },
            1: {
                0: { 0: '╿', 1: '┞', 2: '┡', },
                1: { 0: '┦', 1: '╀', 2: '╄', },
                2: { 0: '┩', 1: '╃', 2: '╇', },
            },
            2: {
                0: { 0: '┃', 1: '┠', 2: '┣', },
                1: { 0: '┨', 1: '╂', 2: '╆', },
                2: { 0: '┫', 1: '╉', 2: '╋', },
            },
        },
    }
}

function cross(t: TermBuf, x: number, y: number, maxX: number, maxY: number) {
    const lt = y >= 1 ? t.getchar(x, y - 1).char == '┃' ? 2 : 1 : 0,
        lb = y < maxY ? t.getchar(x, y + 1).char == '┃' ? 2 : 1 : 0,
        ll = (x >= 1) ? t.getchar(x - 1, y).char == '━' ? 2 : 1 : 0,
        lr = x < maxX ? t.getchar(x + 1, y).char == '━' ? 2 : 1 : 0;

    return chars.crossings[lt][lb][ll][lr];
}

export interface tchar {
    char: string,
    attr: attr
}

export enum Color {
    Black = 0,
    Red = 1,
    Green = 2,
    Yellow = 3,
    Blue = 4,
    Pink = 5,
    Cyan = 6,
    White = 7,
    LightBlack = 60,
    LightRed = 61,
    LightGreen = 62,
    LightYellow = 63,
    LightBlue = 64,
    LightPink = 65,
    LightCyan = 66,
    LightWhite = 67,
}

const BACK_OFFSET = 40, FORE_OFFSET = 30;

export interface attr {
    back: Color,
    fore: Color,
    bold?: boolean,
    strike?: boolean
}

export const DEFAULT_ATTR: attr = {
    back: Color.Black,
    fore: Color.White,
    bold: false,
    strike: false
}