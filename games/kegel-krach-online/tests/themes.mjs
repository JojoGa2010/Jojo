import {readFileSync} from 'node:fs';
import {runInContext} from 'node:vm';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const html=readFileSync(process.argv[2],'utf8'),themeSource=readFileSync(new URL('../assets/themes.js',import.meta.url),'utf8');
const palettes=new Set(),scenes=new Set();
for(let month=0;month<12;month++){
  const dom=new JSDOM(html.replace(/<script>[\s\S]*?<\/script>/,''),{url:'https://example.test/spiel/',runScripts:'outside-only'}),w=dom.window;
  const RealDate=w.Date;w.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[2026,month,15,12]));}};
  w.requestAnimationFrame=()=>0;
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:()=>()=>{}});
  const run=code=>runInContext(code,dom.getInternalVMContext());
  run(html.match(/<script>([\s\S]*?)<\/script>/)[1]);const oldPin=run('pin'),colors=run('JSON.stringify(COL)');run(themeSource);
  await new Promise(r=>setTimeout(r,270));
  const t=w.KKSeasonal.themeForDate(new w.Date());
  assert.equal(w.document.documentElement.dataset.kkMonth,String(month+1));
  assert.ok(w.document.querySelector('#kk-month-label').textContent.startsWith(t.name));
  assert.equal(run('TH.n'),t.name);assert.equal(run('pin'),oldPin);assert.equal(run('JSON.stringify(COL)'),colors);
  scenes.add(w.document.documentElement.style.getPropertyValue('--kk-scene'));
  palettes.add(run('JSON.stringify([TH.fr,TH.bd,TH.cell,TH.gr])'));
  for(const p of w.document.querySelectorAll('body>.fl')){
    assert.equal(p.dataset.season,t.season);assert.ok(t.weather.icons.includes(p.textContent));
  }
  const expected=month===11||month<2?'winter':month<5?'spring':month<8?'summer':'autumn';assert.equal(t.season,expected);
  run("show('game')");await new Promise(r=>setTimeout(r,0));assert.ok(w.document.body.classList.contains('kk-playing'));
  console.log('PASS: '+t.name+' has monthly scene/board and '+t.weather.name+' particles');
  dom.window.close();
}
assert.equal(scenes.size,12);assert.equal(palettes.size,12);
console.log('PASS: 12 distinct backgrounds and board palettes; all seasonal boundaries correct; original figures/player colours unchanged');
