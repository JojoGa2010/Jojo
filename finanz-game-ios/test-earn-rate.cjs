const assert=require('node:assert/strict');
const {Game:G}=require('./FinanzGame/Web/engine.js');
for(const job of [-1,0,4,G.JOBS.length-1])for(const seconds of [.25,1,5,10]){const s=G.fresh();s.job=job;s.careerProfiles[job]={level:5,successfulMonths:0};const cash=s.cash;assert.equal(G.tick(s,seconds,true,()=>.5),seconds);assert(Math.abs(s.cash-cash-seconds)<1e-9);}
const idle=G.fresh();const cash=idle.cash;G.tick(idle,10,false,()=>.5);assert.equal(idle.cash,cash);G.tap(idle);assert.equal(idle.cash,cash+1);
console.log('PASS: hold pays exactly 1 game euro/second including partial seconds, independent of job/upgrade; idle pays no card money; tap stays 1.');
