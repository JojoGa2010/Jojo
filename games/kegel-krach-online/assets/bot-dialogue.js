/* Local German dialogue with per-person memory and live board context. No remote service. */
(() => {
  const memories=new Map();
  const norm=t=>String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
  const pick=(items,m)=>items[(m.count++)%items.length];
  function reply(text,bot,state,uid='local'){
    const key=uid,m=memories.get(key)||{count:0,topic:'',name:'',favorite:'',last:''};memories.set(key,m);
    const t=norm(text).trim(),seat=state.pl.findIndex(p=>p.uid===bot.uid),end=state.pl.length>4?60:40;
    const goal=state.pc[seat].filter(v=>v>=end).length,out=state.pc[seat].filter(v=>v>=0&&v<end).length;
    const player=state.pl.find(p=>p.uid===uid)||state.pl.find(p=>!p.bot),who=m.name||player?.n||'du';
    const result=s=>{m.last=s;return s;};
    const introduced=String(text).match(/(?:ich hei(?:ß|ss)e|mein name ist|nenn mich)\s+([\p{L}-]{2,18})/iu);
    if(introduced){m.name=introduced[1];m.topic='name';return result('Freut mich, '+m.name+'! Ich bin '+bot.n+'. Spielen wir?');}
    if(/wie heisse ich|mein(?:en)? name(?:n)? noch|kennst du mich/.test(t))return result('Du heißt '+who+'. Das habe ich mir für diese Runde gemerkt.');
    if(/wer bist|dein name|wie heisst du|bist du.*bot|bist du.*echt|bist du.*ki/.test(t))return result('Ich bin '+bot.n+', ein Spiel-Bot. Ich antworte mit lokalen Dialogregeln.');
    const arithmetic=t.match(/(-?\d+(?:[.,]\d+)?)\s*([+*×/÷-])\s*(-?\d+(?:[.,]\d+)?)/);
    if(arithmetic){const a=Number(arithmetic[1].replace(',','.')),b=Number(arithmetic[3].replace(',','.')),op=arithmetic[2],n=op==='+'?a+b:op==='-'?a-b:['*','×'].includes(op)?a*b:b===0?NaN:a/b;return result(Number.isFinite(n)?arithmetic[0]+' = '+Number(n.toFixed(6))+'. Kopfrechnen kann ich auch!':'Durch null kann man nicht teilen.');}
    if(/wer.*dran|wessen.*zug|bin ich.*dran/.test(t)){m.topic='turn';return result('Jetzt ist '+state.pl[state.turn].n+' dran'+(state.phase==='roll'?': den großen Würfel antippen.':': eine erlaubte Figur ziehen.') );}
    if(/wie.*spiel|wie geht (das|dieses|kegel)|wie funktioniert|regel|hilfe|was muss|was soll.*tun/.test(t)){m.topic='rules';return result('Mit einer 6 kommst du raus. Passende Figur antippen; alle vier müssen genau ins Ziel.');}
    if(/warum|wieso|weshalb/.test(t)&&(/sechs|raus|start/.test(t)||m.topic==='rules'))return result('Die 6 bringt einen Kegel aus dem Haus auf sein Startfeld. Danach ziehen andere Würfe.');
    if(/nicht.*(ziehen|bewegen)|keine.*(figur|kegel)|kann.*nicht.*(fahren|spielen)/.test(t)){m.topic='rules';return result('Du brauchst einen legalen Zug: keine eigene Figur blockieren und genau ins Ziel kommen.');}
    if(/wie viele|wieviel|deine.*kegel|im ziel|hast du.*ziel/.test(t)){m.topic='score';return result('Ich habe '+goal+' Kegel im Ziel, '+out+' auf dem Weg und '+(4-goal-out)+' im Haus.');}
    if(/wer.*(fuhrt|vorne|gewinnt)|spielstand|gewinnst du/.test(t)){
      const ranks=state.pl.map((p,i)=>({n:p.n,goals:state.pc[i].filter(v=>v>=end).length,progress:state.pc[i].reduce((s,v)=>s+Math.max(0,v),0)})).sort((a,b)=>b.goals-a.goals||b.progress-a.progress);
      return result(ranks[0].n+' liegt gerade vorne: '+ranks[0].goals+' Kegel im Ziel. Noch ist alles offen!');
    }
    if(/kick|schlag|rauswerf|weggekickt/.test(t)){m.topic='kick';return result('Landest du auf einem fremden Kegel, kickst du ihn heim. Eigene Kegel darfst du nicht schlagen.');}
    if(/wurfel|wurfelst|sechs|gluck|pech|schummel|betrug/.test(t)){m.topic='dice';return result(/schummel|betrug/.test(t)?'Ich wähle meine Züge, aber meine Würfe sind zufällig. Manchmal habe ich einfach Glück!':pick(['Den großen Würfel antippen. Bei einer 6 darfst du noch einmal würfeln.','Eine 6 wäre gut! Aber auch kleine Würfe helfen, genau ins Ziel zu kommen.'],m));}
    if(/warum|wieso|weshalb/.test(t)&&m.topic==='dice')return result('Der Wurf ist zufällig. Fürs Ziel zählt dann, welche deiner Figuren du bewegst.');
    if(/uno|karten|farben.krach/.test(t)){m.topic='cards';return result('Farben-Krach findest du in der Spielauswahl. Dort kannst du Karten gegen Bots spielen!');}
    if(/wie geht|geht.s dir|alles klar|was geht/.test(t)){m.topic='mood';return result(pick(['Mir geht’s gut! Ich hoffe auf eine 6. Und wie geht’s dir?','Bestens! Meine Kegel sind bereit. Wie läuft dein Tag?'],m));}
    if(/traurig|schlecht.*geht|mir geht.*schlecht|nicht gut|einsam/.test(t)){m.topic='mood';return result('Das klingt nach einem blöden Tag. Magst du erzählen, was los ist?');}
    if(/(?:mir geht|bin|heute).*(gut|super|toll|glucklich)|alles gut/.test(t)){m.topic='mood';return result('Das freut mich! Was war heute besonders schön?');}
    if(/und du|und dir|bei dir|dir auch/.test(t)){
      if(m.topic==='favorite')return result('Ich mag Kegel-Krach am liebsten. Beim Kartenspielen nehme ich gern Richtungswechsel!');
      if(m.topic==='mood')return result('Bei mir läuft’s gut. Ein spannendes Spiel und nette Mitspieler reichen mir!');
      return result('Ich überlege gerade, welchen Kegel ich als Nächstes ins Ziel bringe.');
    }
    const favorite=String(text).match(/(?:ich mag|ich liebe|mein lieblings\w* ist)\s+(.{2,32})/iu);
    if(favorite){m.favorite=favorite[1].replace(/[!?.,]+$/,'');m.topic='favorite';return result(m.favorite+' magst du also! Was gefällt dir daran am besten?');}
    if(/was mag ich|mein lieblings|was liebe ich/.test(t)&&m.favorite)return result('Du hast gesagt, dass du '+m.favorite+' magst.');
    if(/lieblings|was magst du|hobby|hobbys/.test(t)){m.topic='favorite';return result('Mein Lieblingsspiel ist Kegel-Krach. Und was spielst du am liebsten?');}
    if(m.topic==='favorite'&&/weil|macht spass|lustig|spannend/.test(t))return result('Kann ich verstehen! Wenn ein Spiel spannend bleibt, will man gleich noch eine Runde.');
    if(/was machst|was tust|dein plan|strategie/.test(t)){m.topic='strategy';return result(goal===3?'Drei sind schon im Ziel. Jetzt bringe ich den letzten Kegel sicher nach Hause!':out===0?'Meine Kegel sind noch im Haus. Ich brauche erst eine 6.':'Ich halte '+out+' Kegel im Rennen und schaue, wo ich genau ins Ziel komme.');}
    if(/witz|erzahl.*lustig/.test(t)){m.topic='joke';return result(pick(['Warum nimmt der Kegel kein Taxi? Er lässt sich lieber heimkicken!','Was sagt ein Kegel beim Umfallen? Das haut mich um!','Warum ist der Würfel so entspannt? Er lässt die Dinge rollen.'],m));}
    if(/noch ein|nochmal|weiter|anderen/.test(t)&&m.topic==='joke')return result(pick(['Was macht ein Kegel im Urlaub? Er lässt sich nicht umwerfen!','Warum hat der Würfel sechs Freunde? Für jede Seite einen.'],m));
    if(/haha|lol|😂|lustig/.test(t))return result('Du lachst jetzt – warte, bis meine Kegel aufholen!');
    if(/danke|lieb von dir/.test(t))return result('Gern, '+who+'! Was möchtest du noch wissen?');
    if(/gut gemacht|super|stark|gluckwunsch|\bgg\b/.test(t))return result('Danke! Dein nächster guter Zug kommt bestimmt auch.');
    if(/doof|blod|dumm|schlecht|idiot/.test(t))return result('Autsch! Lass lieber die Kegel für uns sprechen. Ich gebe noch nicht auf.');
    if(/tschuss|bye|gute nacht|bis bald/.test(t))return result('Bis bald, '+who+'! Danke für die Runde.');
    if(/hallo|\bhi\b|\bhey\b|servus|moin|guten tag/.test(t))return result('Hallo '+who+'! '+bot.n+' hier. Wie geht’s dir?');
    if(/ja|genau|klar|stimmt|nein|naja/.test(t)&&t.length<18)return result(m.topic==='mood'?'Erzähl ruhig – was war heute los?':m.topic==='rules'?'Möchtest du wissen, wie das Rauskommen, Schlagen oder Gewinnen funktioniert?':'Was meinst du genau? Frag mich zum Spiel oder erzähl von dir.');
    // Be honest when a local rule cannot understand an open-ended sentence.
    const quote=String(text).replace(/[<>\n]/g,'').trim().slice(0,34);
    return result('Was meinst du mit „'+quote+'“? Frag mich etwas genauer, dann versuche ich zu helfen.');
  }
  window.KKBotDialogue={reply,reset:()=>memories.clear()};
})();
