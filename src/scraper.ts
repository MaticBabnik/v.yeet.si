import needle from 'needle';
import { JSDOM } from 'jsdom';

export class Scraper {

    private schoolId: eaId;
    private classes: Map<string, eaId>
    private scrapeInterval: number;
    public cache: Map<string, ScrapeResult>

    constructor(schoolId: eaId, classMap: Map<string, eaId>, scrapeInterval: number) {
        this.schoolId = schoolId;
        this.classes = classMap;

        this.scrapeInterval = scrapeInterval;

        this.cache = new Map<string, ScrapeResult>();

        // run the scrape
        this.ScrapeAll();
        this.scheduleScrapes();
    }



    private scheduleScrapes() {
        const delayBetween = this.scrapeInterval / (this.classes.size + 1) * 1_000;

        for (let i = 0, delay = 0; i < this.classes.size; i++, delay += delayBetween) {
            setTimeout(() => {
                setInterval(() => {
                    const [classname, classid] = [...this.classes.entries()][i];
                    this.Scrape(classid).then(r => {
                        this.cache.set(classname, r);
                    })
                }, this.scrapeInterval)
            }, delay);
        }
    }


    private async ScrapeAll() {
        for (let [name, id] of this.classes.entries()) {
            let r = await this.Scrape(id);
            this.cache.set(name, r);
        }
    }

    private static isRowEmpty(arr: any[]): boolean {
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] != null) return false;
        }
        return true;
    }


    public async Scrape(id: eaId): Promise<ScrapeResult> {
        try {
            const response = await needle('post', 'https://www.easistent.com/urniki/ajax_urnik', {
                "id_sola": this.schoolId,
                "id_razred": id,
                "id_profesor": 0,
                "id_dijak": 0,
                "id_ucilnica": 0,
                "id_interesna_dejavnost": 0,
                "qversion": 1
            }, { user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36' });

            const dom = new JSDOM(response.body).window.document; //parse the HTML into a DOM tree

            const rows = Array.from(dom.querySelectorAll('.ednevnik-seznam_ur_teden > * > tr'))
                .filter((_, i1) => i1 != 0); //discard the first row (it's the header)

            const timetable: lessons[][] = [...Array(14).keys()].map(x => Array(5));
            const times: string[][] = [];

            rows.forEach((el, h) => {
                Array.from(el.querySelectorAll('.ednevnik-seznam_ur_teden-td')).forEach((el1, d) => {
                    const test = Array.from(el1.querySelectorAll('div.ednevnik-seznam_ur_teden-urnik'));

                    if (d === 0) {
                        const time = el1.querySelector('.text10')?.innerHTML.split(' - ');
                        if (time)
                            times.push(time);
                    } else

                        timetable[h][d] = test.length > 0 ? test.map(tst => ({ name: tst.querySelector('span')?.innerHTML, room: tst.querySelector('.text11')?.innerHTML.trim().split(', ')[0], teacher: tst.querySelector('.text11')?.innerHTML.trim().split(', ')[1] })) : null
                });
            })

            let first = 0, last = rows.length - 1;

            //find first and last non empty row
            while (Scraper.isRowEmpty(timetable[first]) && first <= timetable.length / 2) first++;
            while (Scraper.isRowEmpty(timetable[last]) && last > first) last--;

            //return relavant rows
            const out = [];
            for (let i = first; i <= last; i++) {
                out.push(timetable[i]);
            }
            return { lessons: out, time: Date.now() };
        } catch (e: any) {
            return { error: e.toString(), time: Date.now() };
        }
    }
}

interface ScrapeResult {
    error?: string,
    lessons?: lessons[][],
    time: Number
}

type eaId = number;

type lessons = lesson[] | null;

interface lesson {
    name?: string,
    room?: string,
    teacher?: string
}
