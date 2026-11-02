// Local QA server; no WordPress credentials or external traffic required.
import{readFileSync}from'node:fs';import{resolve,extname}from'node:path';import{createServer}from'node:http';
import{PHP}from'@php-wasm/universal';import{loadNodeRuntime}from'@php-wasm/node';
const php=new PHP(await loadNodeRuntime('8.4',{emscriptenOptions:{processId:1}}));
const harness=readFileSync(new URL('server.php',import.meta.url),'utf8').split("$host=call_api(")[0].replace("require '/plugin.php';",'').replace('$wpdb=new DB();',"$wpdb=new DB();$wpdb->rows=json_decode(file_get_contents('/rooms.json'),true);");
php.writeFile('/harness.php',harness);php.writeFile('/cards.php',readFileSync(new URL('../includes/cards.php',import.meta.url)));php.writeFile('/rooms.json','{}');
let queue=Promise.resolve();const root=resolve('work/kk-mobile-preview');
const server=createServer(async(req,res)=>{
 if(req.url==='/api/cards'){
  let body='';for await(const chunk of req)body+=chunk;if(body.length>3000){res.writeHead(413).end();return;}
  queue=queue.then(async()=>{php.writeFile('/request.json',body);const r=await php.run({code:"<?php require '/harness.php';require '/cards.php';$result=KK_Cards::request(new Request(json_decode(file_get_contents('/request.json'),true)));file_put_contents('/rooms.json',json_encode($wpdb->rows));echo json_encode($result instanceof WP_Error?['status'=>$result->data['status'],'data'=>['message'=>$result->message]]:['status'=>200,'data'=>$result->data]);"});let out;try{out=JSON.parse(r.text);}catch{console.error(r.text,r.errors);res.writeHead(500).end('{}');return;}res.writeHead(out.status,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify(out.data));}).catch(e=>{console.error(e);res.writeHead(500).end('{}');});return;
 }
 const pathname=decodeURIComponent((req.url||'/').split('?')[0]);const path=resolve(root,'.'+(pathname==='/'?'/cards-preview.html':pathname));if(!path.startsWith(root+'/')){res.writeHead(403).end();return;}
 try{const data=readFileSync(path),type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[extname(path)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(data);}catch{res.writeHead(404).end();}
});server.listen(8768,'127.0.0.1',()=>console.log('Card preview: http://127.0.0.1:8768/cards-preview.html'));
