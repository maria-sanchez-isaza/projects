import {readFile,writeFile} from 'node:fs/promises';
const read=p=>readFile(p,'utf8');
const clean=s=>s.replace(/^import .*;\r?\n/gm,'').replaceAll('export const ','const ').replaceAll('export function ','function ');
const asset=await readFile('dist/assets/faculty.png');
const assetScript=`const bytes=Uint8Array.from(atob('${asset.toString('base64')}'),c=>c.charCodeAt(0)); const FACULTY_SRC=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));\n`;
const code=assetScript+clean(await read('dist/content.js'))+'\nconst C=COLORS;\n'+clean(await read('dist/composition.js')).replace('href="assets/faculty.png"','href="${FACULTY_SRC}"')+'\n'+clean(await read('dist/player.js'));
const html=(await read('dist/index.html')).replace('<link rel="stylesheet" href="styles.css">',`<style>${await read('dist/styles.css')}</style>`).replace('<script type="module" src="player.js"></script>',`<script type="module">${code}</script>`);
await writeFile('XR-with-purpose.html',html);
console.log('Created XR-with-purpose.html (self-contained offline player).');
