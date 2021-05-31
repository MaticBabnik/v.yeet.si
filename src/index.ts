import express from 'express';

import {Scraper} from './scraper'

const app = express();


const settings = require('./settings.json');


let homepage = "";
const clsRegex = new RegExp(settings.classRegex, 'i');

app.use((req,res,next)=>{
    if (!req.headers['user-agent']?.includes('wget') && !req.headers['user-agent']?.includes('curl')) {
        res.send('Use curl or wget');
    } else next();
});


app.get('/',(rq, rs) => {
    rs.send(homepage);
})




app.get('/:cls', async (rq, rs) => {

    //parse cls
    if (!rq.params['cls']) return homepage;
    const matches = rq.params['cls'].match(clsRegex);

    if (!matches) return homepage;

    const cls = `${matches[1]}${matches[2]}${matches[3]}`.toUpperCase();

    if (!cache[cls]) return `${cls} ni veljaven razred\n`;

    return await cachedTimetable(cls);


})

async function start() {
    try {
        await server.listen(3000)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

function initCache() {
    Object.keys(settings.classes).forEach(x => cache[x] = { data: null, last: 0, id: settings.classes[x] });

    const lines = Array(10);

    let curLine = 0;
    for (let cls in settings.classes) {
        if (!lines[curLine]) lines[curLine] = ''
        lines[curLine] += st.padLeft(cls, 10);
        curLine++;
        curLine %= lines.length;
    }

    homepage += "Nisi izbral razreda.\npojdi na v.yeet.si/<razred>, kjer je <razred> eden izmed:\n\n";


    homepage += lines.map(x => x + '\n').join('');


}


initCache();
start()