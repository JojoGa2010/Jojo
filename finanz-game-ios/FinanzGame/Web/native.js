const nativeBridge=window.webkit?.messageHandlers?.finanz;
if(nativeBridge){
 document.documentElement.classList.add('native-app');
 const originalPreferenceUpdate=applyPreferences;
 applyPreferences=function(){originalPreferenceUpdate();nativeBridge.postMessage({type:'appearance',value:preferences.theme});};
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;if(d.page&&['overview','career','stocks','assets','settings'].includes(d.page))nativeBridge.postMessage({type:'navigate',value:d.page});if(d.do==='export'){e.stopImmediatePropagation();nativeBridge.postMessage({type:'export',value:JSON.stringify(state)});}},true);
 document.addEventListener('click',e=>{if(e.target.id==='import'){e.preventDefault();nativeBridge.postMessage({type:'import'});}},true);
 window.importNativeSave=function(payload){const parsed=JSON.parse(payload);if(!G.valid(parsed))throw new Error('Invalid save');state=parsed;state.last=Date.now();save();render();toast('Spielstand geladen.');return true;};
}
