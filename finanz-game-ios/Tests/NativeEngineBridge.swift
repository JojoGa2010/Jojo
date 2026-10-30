import Foundation
import JavaScriptCore
let context=JSContext()!
context.evaluateScript("var window=this;")
let source=try String(contentsOfFile:CommandLine.arguments[1],encoding:.utf8)
context.evaluateScript(source)
if let e=context.exception{fatalError(e.toString())}
let g=context.objectForKeyedSubscript("Game")!
let s=g.forProperty("fresh")!.call(withArguments:[])!
@discardableResult func action(_ name:String,_ args:[Any]=[])->JSValue{return g.forProperty(name)!.call(withArguments:[s]+args)!}
assert(action("valid").toBool())
let cash=s.forProperty("cash")!.toDouble()
assert(action("tap").toInt32()==1)
assert(s.forProperty("cash")!.toDouble()==cash+1)
action("tick",[5,true]);assert(abs(s.forProperty("cash")!.toDouble()-(cash+6))<0.001)
assert(action("changeBank",["N26"]).toString()=="")
assert(s.forProperty("bank")!.toString()=="N26")
assert(action("setService",["power",false]).toString()=="")
assert(action("foundCompany",["freelance","Native Test"]).toString()=="")
assert(action("valid").toBool())
let signature=[[[0.1,0.8],[0.15,0.3],[0.3,0.6],[0.4,0.2],[0.55,0.5],[0.8,0.3]]]
assert(action("apply",[0]).toString()=="")
assert(action("signApplication",[signature]).toString()=="")
action("tick",[45,false])
assert(action("beginTask").toString()=="")
assert(action("answerTask",[0]).toString()=="")
assert(action("valid").toBool())
for answer in [1,2] {
    assert(action("startTask",["trial"]).toString()=="")
    assert(action("beginTask").toString()=="")
    assert(action("answerTask",[answer]).toString()=="")
}
action("tick",[30,false])
assert(s.forProperty("job")!.toInt32()==0)
assert(action("startTask",["work"]).toString()=="")
assert(action("beginTask").toString()=="")
assert(action("answerTask",[0]).toString()=="")
assert(action("loan",[1000]).toString()=="")
assert(action("repayLoan",[0]).toString()=="")
assert(s.forProperty("loans")!.toArray()!.isEmpty)
let data=try JSONSerialization.data(withJSONObject:s.toDictionary()!)
assert(data.count>1000)
let imported=context.evaluateScript("Game.migrate(JSON.parse('"+String(data:data,encoding:.utf8)!.replacingOccurrences(of:"'",with:"\\'")+"'))")!
assert(g.forProperty("valid")!.call(withArguments:[imported])!.toBool())
let elapsed=imported.forProperty("elapsed")!.toDouble()
imported.setValue(Date().timeIntervalSince1970*1000-25_000,forProperty:"last")
g.forProperty("catchUp")!.call(withArguments:[imported])
assert(imported.forProperty("elapsed")!.toDouble()>=elapsed+24.9)
assert(context.exception==nil)
print("PASS: JavaScriptCore catalog/state bridge, exact tap/hold rates, bank/services, founding, native signature arrays, question actions and JSON save serialization.")
