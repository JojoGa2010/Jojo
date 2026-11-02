import{readFileSync}from'node:fs';
import{PHP}from'@php-wasm/universal';
import{loadNodeRuntime}from'@php-wasm/node';
const php=new PHP(await loadNodeRuntime('8.4',{emscriptenOptions:{processId:1}}));
const harness=readFileSync(new URL('server.php',import.meta.url),'utf8').split("$host=call_api(")[0].replace("require '/plugin.php';",'');
php.writeFile('/harness.php',harness);php.writeFile('/cards.php',readFileSync(new URL('../includes/cards.php',import.meta.url)));
const tests=readFileSync(new URL('cards.php',import.meta.url),'utf8').replace("require '/harness.php';","require '/harness.php';require '/cards.php';");
const r=await php.run({code:tests});console.log(r.text);if(r.errors)console.error(r.errors);if(r.exitCode||r.text.includes('FAIL:')||r.text.includes('Fatal error'))process.exitCode=1;php.exit();
