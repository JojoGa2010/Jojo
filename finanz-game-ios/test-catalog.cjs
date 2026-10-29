const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {Game:G} = require('./FinanzGame/Web/engine.js');
const real = G.STOCKS.filter(a=>a.real);
assert.equal(real.length,27);
assert.equal(G.ASSETS.filter(a=>a.category==='Immobilien').length,25);
assert.equal(new Set(G.STOCKS.map(a=>a.id)).size,G.STOCKS.length);
assert.equal(new Set(G.ASSETS.map(a=>a.id)).size,G.ASSETS.length);
for(const a of G.STOCKS){assert(fs.existsSync(path.join(__dirname,'FinanzGame/Web',a.logo)));const s=G.fresh();s.cash=100000;assert.equal(G.trade(s,a.id,1),'');assert.equal(s.shares[a.id],1);assert.equal(G.trade(s,a.id,-1),'');assert(Math.abs(s.cash-(100000-a.base*.01))<1e-6);}
const legacy=G.fresh();for(const a of real)delete legacy.prices[a.id];legacy.cash=12345;legacy.shares.world=7;legacy.prices.world=109;legacy.owned.flat=1;
assert(!G.valid(legacy));G.migrate(legacy);assert(G.valid(legacy));assert.equal(legacy.cash,12345);assert.equal(legacy.shares.world,7);assert.equal(legacy.prices.world,109);assert.equal(legacy.owned.flat,1);assert.equal(legacy.prices.apple,190);
const corrupt=G.fresh();corrupt.prices.apple=-1;G.migrate(corrupt);assert(!G.valid(corrupt));
for(const a of G.ASSETS.filter(a=>a.category==='Immobilien')){const s=G.fresh();s.cash=a.price;assert.equal(G.buy(s,a.id),'');assert.equal(s.cash,0);assert.equal(G.passive(s),a.income);assert.equal(G.sell(s,a.id),'');assert.equal(s.cash,a.price*.9);}
const nodes=new Map();const node=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){}},listeners:{},addEventListener(t,f){(this.listeners[t]??=[]).push(f)},appendChild(){},close(){},showModal(){}});return nodes.get(k)};
const sandbox={console,Intl,Date,Math,JSON,Number,String,Object,Array,Set,performance:{now:()=>0},localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:false,addEventListener(){}}),setInterval(){},setTimeout(){},clearTimeout(){},addEventListener(){},scrollTo(){},document:{createElement:()=>({setAttribute(){},remove(){}}),documentElement:{dataset:{}},querySelector:node,querySelectorAll:()=>[],addEventListener(){}}};sandbox.window=sandbox;vm.createContext(sandbox);
for(const f of ['engine.js','ui.js','career.js','app.js','native.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'FinanzGame/Web',f),'utf8'),sandbox);
vm.runInContext("page='stocks';render();",sandbox);assert(node('#view').innerHTML.includes('Apple Logo'));assert.equal((node('#view').innerHTML.match(/class="stock-logo"/g)||[]).length,31);
vm.runInContext("stockQuery='AAPL';render();",sandbox);assert(node('#view').innerHTML.includes('Apple Logo'));assert(!node('#view').innerHTML.includes('Tesla Logo'));
vm.runInContext("page='assets';category='Immobilien';propertyQuery='Wien';render();",sandbox);assert(node('#view').innerHTML.includes('Zinshaus · Wien'));assert(!node('#view').innerHTML.includes('Starterwohnung · Linz'));
console.log('PASS: 27 real stocks + 4 legacy logos, 25 properties, trades and fees, legacy save migration, invalid-price rejection, property returns, UI search and filters.');

const tapState=G.fresh();const starting=tapState.cash;for(let i=0;i<100;i++)G.tap(tapState);assert.equal(tapState.cash,starting+100);assert(Math.abs(tapState.xp-10)<1e-9);assert.equal(tapState.held,0);assert(G.valid(tapState));
vm.runInContext("state=G.fresh();preferences.earningMode='tap';page='overview';render();",sandbox);const beforeTap=vm.runInContext('state.cash',sandbox);const handlers=node('#earn').listeners.click;handlers[handlers.length-1]();assert.equal(vm.runInContext('state.cash',sandbox),beforeTap+1);assert.equal(vm.runInContext('holding',sandbox),false);assert(node('#view').innerHTML.includes('pro Tipp'));
vm.runInContext("preferences.earningMode='hold';render();",sandbox);assert(node('#view').innerHTML.includes('/ Sekunde'));assert.equal(vm.runInContext('holding',sandbox),false);
console.log('PASS: 100 taps give exactly 100 game euros; tap experience, click binding and switching to hold mode.');

vm.runInContext("page='career';selectedJob=0;render();",sandbox);assert(node('#view').innerHTML.includes('Bewerbung einreichen'));assert(node('#view').innerHTML.includes('Aufstieg &amp; Chefbeurteilung'));vm.runInContext("page='assets';category='Unternehmen';propertyQuery='';render();",sandbox);assert(node('#view').innerHTML.includes('companyForm'));assert(node('#view').innerHTML.includes('Digital-Service'));console.log('PASS: job detail and company founding UI render.');
