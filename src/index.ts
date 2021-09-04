import express from 'express';

import {Scraper} from './scraper'

import settings from './settings.json';


const app = express();
const classes = new Map(Object.entries(settings.classes));

const scraper = new Scraper(settings.school.id,classes,1000000);


setTimeout(()=>{
    [...scraper.cache.values()].forEach(x=>{
        console.table(x.lessons);
    })
},5000)