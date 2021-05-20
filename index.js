/**
 * @type {import('fastify').FastifyInstance}
 * bit scuffed
 */
const fastify = require('fastify')({ logger: true });
const settings = require('./settings.json');
const st = require('./stringTools');
const {gen,getUrnik} = require('./scraper');

const cache = {};

let homepage = "";
const clsRegex = new RegExp(settings.classRegex,'i');


async function cachedTimetable(cls) {
    const c = cache[cls];
    if (Date.now() - cache[cls].last  > settings.cacheMaxAgeSeconds * 1000) {
        
        cache[cls].last = Date.now();
        cache[cls].data = gen(await getUrnik(1,settings.school.id,cache[cls].id));
    }
    return cache[cls].data;
}

fastify.get('/', async (rq, rs) => {
    if (!rq.headers['user-agent'].includes('wget') && !rq.headers['user-agent'].includes('curl')) {
        return 'Use cURL or wget';
    }




    return  homepage;

})

fastify.get('/:cls', async (rq,rs)=> {
    if (!rq.headers['user-agent'].includes('wget') && !rq.headers['user-agent'].includes('curl')) {
        return 'Use cURL or wget';
    }

    //parse cls
    if (!rq.params.cls) return homepage;
    const matches = rq.params.cls.match(clsRegex);
    
    if (!matches) return homepage;

    const cls = `${matches[1]}${matches[2]}${matches[3]}`.toUpperCase();

    if (!cache[cls]) return `${cls} ni veljaven razred\n`;
    
    return await cachedTimetable(cls);


})

async function start() {
    try {
        await fastify.listen(process.env.PORT ?? 3000)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

function initCache() {
    Object.keys(settings.classes).forEach(x=>cache[x] = {data:null, last:0, id: settings.classes[x]});
    
    const lines = Array(10);

    let curLine = 0;
    for (cls in settings.classes) {
        if (!lines[curLine]) lines[curLine] = ''
        lines[curLine]+= st.padLeft(cls,10);
        curLine++;
        curLine %= lines.length;
    }

    homepage += "Nisi izbral razreda.\npojdi na v.yeet.si/<razred>, kjer je <razred> eden izmed:\n\n";


    homepage +=  lines.map(x=>x+'\n').join('');


}


initCache();
start()
