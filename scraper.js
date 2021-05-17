/*
POST https://www.easistent.com/urniki/ajax_urnik
body:
id_sola
id_razred
id_profesor
id_dijak
id_ucilnica
teden
id_interesna_dejavnost
qversion
*/

const needle = require('needle')
const { JSDOM } = require('jsdom')
const st = require('./stringTools')

function isRowEmpty(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] != null) return false;
    }
    return true;
}

async function getUrnik(teden, sola, razred) {
    const res = await needle('post', 'https://www.easistent.com/urniki/ajax_urnik', {
        "id_sola": sola,
        "id_razred": razred,
        "id_profesor": 0,
        "id_dijak": 0,
        "id_ucilnica": 0,
        "id_interesna_dejavnost": 0,
        "qversion": 1
    }, { content_type: '', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36' });

    const dom = new JSDOM(res.body).window.document;

    const rows = Array.from(dom.querySelectorAll('.ednevnik-seznam_ur_teden > * > tr')).filter((x1, i1) => i1 != 0);

    const timetable = [...Array(14).keys()].map(x => Array(6));

    rows.forEach((el, h) => {
        Array.from(el.querySelectorAll('.ednevnik-seznam_ur_teden-td')).forEach((el1, d) => {
            const test = Array.from(el1.querySelectorAll('div.ednevnik-seznam_ur_teden-urnik'));
            timetable[h][d] = d == 0 ? el1.querySelector('.text10').innerHTML.split(' - ') :
                test.length > 0 ? test.map(tst => ({ title: tst.querySelector('span').innerHTML, placeAndTeacher: tst.querySelector('.text11').innerHTML.trim().split(', ') })) : null
        });
    })

    let first = 0, last = rows.length - 1;

    //find first and last non empty row
    while (isRowEmpty(timetable[first]) && first <= timetable.length / 2) first++;
    while (isRowEmpty(timetable[last]) && last > first) last--;

    //return relavant rows
    const out = [];
    for (let i = first; i <= last; i++) {
        out.push(timetable[i]);
    }
    return out;
}

const c = {
    bright: "\033[97m",
    normal: "\033[0m",
    red: "\033[31m",
    reset: "\033[0m"
}

function sSeg(n) {
    return '+' + ('-'.repeat(n));
}
function genContent(arrT, arrS) {
    let o = "|"
    for (let i = 0; i < arrT.length; i++) {
        o += c.bright + st.padCenter(arrT[i], arrS[i]) + c.normal + '|';
    }
    return o;
}
function shortenC(data) {
    return c.red + st.padRight(data.title, 6) + c.normal + data.placeAndTeacher[0].substr(0, 4).replace('. ', '') + c.bright + st.padLeft(data.placeAndTeacher[1], 4) + c.normal;
}


function gen(data) {
    const seperator = c.normal + sSeg(5) + sSeg(12).repeat('5') + '+';
    const header = genContent(['URA', 'PON', 'TOR', 'SRE', 'CET', 'PET'], [5, 12, 12, 12, 12, 12]);
    const urnik = [seperator, header, seperator];

    for (row of data) {

        let rTop = '|', rBot = '|';
        rTop += st.padLeft(row[0][0], 5) + '|';
        rBot += st.padLeft(row[0][1], 5) + '|';

        for (let day = 1; day <= 5; day++) {
            if (row[day] == null) {
                rTop += st.padLeft('', 12) + '|';
                rBot += st.padLeft('', 12) + '|';
            } else {
                rTop += (shortenC(row[day][0])) + '|';
                if (row[day].length > 1) shortenC(row[day][1]) + '|';
                else rBot += st.padLeft('', 12) + '|';
            }
        }

        urnik.push(rTop);
        urnik.push(rBot);
        urnik.push(seperator);
    }

    return urnik.join('\n') + '\n';
}

module.exports = { getUrnik, gen };