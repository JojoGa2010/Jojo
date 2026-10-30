const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {Game:G} = require('./FinanzGame/Web/engine.js');
const s=G.fresh();
for (const bank of G.BANKS) { assert.equal(G.changeBank(s,bank),''); assert.equal(s.bank,bank); }
let snapshot=JSON.stringify(s);
assert(G.changeBank(s,'Unbekannt')); assert.equal(JSON.stringify(s),snapshot);
for (const service of G.SERVICES) { assert.equal(G.setService(s,service.id,false),'');assert.equal(s.life.services[service.id],false);assert.equal(G.setService(s,service.id,true),''); }
snapshot=JSON.stringify(s);assert(G.setService(s,'power','false'));assert(G.setService(s,'unknown',false));assert.equal(JSON.stringify(s),snapshot);
s.job=0;assert.equal(G.loan(s,1000),'');
snapshot=JSON.stringify(s);assert(G.repayLoan(s,-1));assert(G.repayLoan(s,1));assert.equal(JSON.stringify(s),snapshot);
const balance=s.loans[0].balance;s.cash=balance-1;snapshot=JSON.stringify(s);assert(G.repayLoan(s,0));assert.equal(JSON.stringify(s),snapshot);
s.cash=balance+5;assert.equal(G.repayLoan(s,0),'');assert.equal(s.cash,5);assert.equal(s.loans.length,0);assert(G.valid(s));
for(const stock of G.STOCKS){const data=fs.readFileSync(path.join(__dirname,'FinanzGame/Web/assets/logos/native',stock.id+'.png'));assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert(data.readUInt32BE(16)>=128);assert(data.readUInt32BE(20)>=128);}
const project=fs.readFileSync(path.join(__dirname,'FinanzGame.xcodeproj/project.pbxproj'),'utf8');
for(const name of ['NativeCore','NativeComponents','CareerViews','WealthViews','LifeViews','SettingsViews']) assert(project.includes(name+'.swift in Sources'));
console.log('PASS: native bank/service/repayment actions, atomic rejection, all 31 local PNG logos and Xcode source membership.');
