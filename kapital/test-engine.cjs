const assert=require('node:assert/strict');const {Game:G}=require('./dist/engine.js');
let s=G.fresh();assert(G.valid(s));G.tick(s,10,true);assert.equal(s.cash,2502);assert.equal(s.xp,1);
s=G.fresh();assert.equal(G.apply(s,0),'');G.tick(s,720);assert(Math.abs(s.cash-4050)<.01);
s=G.fresh();s.cash=100000;s.job=4;assert.equal(G.buy(s,'garage',true),'');assert.equal(s.cash,92800);assert.equal(s.owned.garage,1);assert.equal(s.loans.length,1);let debt=G.debt(s);G.tick(s,720);assert(G.debt(s)<debt);
s=G.fresh();s.cash=10000;let before=JSON.stringify(s);assert(G.buy(s,'garage',true));assert.equal(JSON.stringify(s),before,'Rejected loan must not mutate state');
s=G.fresh();assert.equal(G.trade(s,'world',1),'');assert.equal(G.trade(s,'world',-1),'');assert(Math.abs(s.cash-2498.95)<.001);assert(G.trade(s,'world',-1));assert(G.trade(s,'world',.5));
s=G.fresh();s.cash=30000;G.buy(s,'garage');G.sell(s,'garage');assert.equal(s.cash,27600);assert.equal(s.owned.garage,0);
s=G.fresh();assert(G.loan(s,1000));s.job=0;assert.equal(G.loan(s,1000),'');for(let i=0;i<40;i++)G.tick(s,720,false,()=>.5);assert.equal(s.loans.length,0);assert(s.cash>=0);assert(G.valid(s));assert(!G.valid({...s,cash:NaN}));assert(!G.valid({...s,bank:'other'}));
console.log('Passed: holding, career salary, financing, atomic rejection, trading fees, asset resale, loan amortization, save validation.');
