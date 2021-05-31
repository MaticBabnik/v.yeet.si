import {Color, TermBuf} from './term'



console.log('Normal');
console.log(new TermBuf(60, 20).drawTable([5, 10, 10, 10, 10], [1, 2, 2, 2, 2, 2], false, false, {back:Color.Black, fore:Color.LightBlack}).toString());
console.log('Thicc border');
console.log(new TermBuf(60, 20).drawTable([5, 10, 10, 10, 10], [1, 2, 2, 2, 2, 2], true, false).toString());
console.log('Thicc border + thicc first line');
console.log(new TermBuf(60, 20).drawTable([5, 10, 10, 10, 10], [1, 2, 2, 2, 2, 2], true, true).toString());

