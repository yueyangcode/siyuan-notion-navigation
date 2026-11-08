const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const nodes = new Set();
const events = new Map();
const observers = new Set();
const context = {
  module: {exports: {}},
  require: name => {assert.equal(name, 'siyuan'); return {Plugin: class {
    eventBus = {on:(name,fn)=>events.set(name,fn),off:(name,fn)=>{assert.equal(events.get(name),fn);events.delete(name);}};
    async loadData(){return this.saved;}
    async saveData(name,value){assert.equal(name,'settings.json');this.saved=value;}
  },getAllEditor:()=>[]};},
  Map,
  queueMicrotask,
  MutationObserver: class {
    constructor(callback){this.callback=callback;}
    observe(){observers.add(this);}
    disconnect(){observers.delete(this);}
  },
  window: {siyuan:{notebooks:[{id:'box',name:'笔记本'}]}},
  document: {
    body: {},
    querySelectorAll:()=>[],
    querySelector:()=>null,
    createElement: tag => {assert.equal(tag, 'style');return {dataset:{},remove(){nodes.delete(this);}};},
    head: {appendChild: node => nodes.add(node)}
  }
};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../index.js'),'utf8'),context);
async function pathTests(){
 for (let i=0;i<100;i++) {
  const p=new context.module.exports();p.name='siyuan-notion-navigation';
  await p.onload();assert.equal(nodes.size,3);assert.equal(events.size,6);assert.equal(observers.size,1);
  await p.updatePreference('tree',false);assert.equal(nodes.size,2);assert.equal(events.size,6);
  await p.updatePreference('navigation',false);assert.equal(nodes.size,1);assert.equal(events.size,2);
  await p.updatePreference('navigation',true);assert.equal(nodes.size,2);assert.equal(events.size,6);
  await p.updatePreference('search',false);assert.equal(observers.size,0);assert.equal(events.size,4);
  await p.updatePreference('search',true);assert.equal(observers.size,1);assert.equal(events.size,6);
  p.onunload();assert.equal(nodes.size,0);assert.equal(events.size,0);assert.equal(observers.size,0);assert.equal(p.states.size,0);
 }
 const disabled=new context.module.exports();disabled.saved={navigation:false,tree:false,search:false};await disabled.onload();assert.equal(nodes.size,0);assert.equal(events.size,0);disabled.onunload();
 const failing=new context.module.exports();await failing.onload();failing.saveData=async()=>{throw Error('failed');};await assert.rejects(()=>failing.updatePreference('search',false));assert.equal(failing.preferences.search,true);assert.equal(nodes.size,3);failing.onunload();
 const delayed=new context.module.exports();let resolve;delayed.loadData=()=>new Promise(r=>{resolve=r;});const loading=delayed.onload();delayed.onunload();resolve({});await loading;assert.equal(nodes.size,0);assert.equal(events.size,0);
 const plugin=new context.module.exports();
 await plugin.onload();
 const searchRoot={isConnected:true,dataset:{key:'dialog-globalsearch'}},input={closest:selector=>selector.includes('dialog-globalsearch')?searchRoot:null};
 const state={root:searchRoot,titleOnly:true,recent:[{id:'recent-doc'}]};
 plugin.searchStates.set(searchRoot,state);plugin.syncSearch=()=>{};
 const originalTypes={document:false,paragraph:true};
 const config={types:originalTypes,method:0,query:''};
 plugin.onSearchInput({detail:{config,searchElement:input}});
 assert.equal(config.types.document,true);assert.equal(config.types.paragraph,false);
 await Promise.resolve();assert.equal(config.types,originalTypes);
 const detail={config,searchElement:input,blocks:[{id:'native-block'}]};
 plugin.onSearchResults({detail});assert.equal(detail.blocks,state.recent);
 detail.config={...config,query:'search'};detail.blocks=[];
 plugin.onSearchResults({detail});assert.equal(detail.blocks.length,0);
 detail.config={...config,idPath:['scope']};plugin.onSearchResults({detail});assert.equal(detail.blocks.length,0);
 plugin.searchStates.clear();plugin.onunload();
 const oldQuery=context.document.querySelector,oldCreate=context.document.createElement;
 const element=()=>({attributes:{},listeners:{},children:[],classList:{contains(){return false;}},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k];},removeAttribute(k){delete this.attributes[k];},addEventListener(k,v){this.listeners[k]=v;},removeEventListener(k){delete this.listeners[k];},appendChild(n){this.children.push(n);},remove(){this.removed=true;}});
 const back=element(),forward=element(),tabs={before(n){this.nav=n;}};let backClicks=0;
 back.querySelector=forward.querySelector=()=>({outerHTML:'<svg></svg>'});back.click=()=>backClicks++;forward.click=()=>{};back.disabled=true;
 context.document.querySelector=s=>s==='#barBack'?back:s==='#barForward'?forward:tabs;
 context.document.createElement=element;
 plugin.syncTabHistory();const history=plugin.tabHistory;assert.equal(history.pairs[0].button.disabled,true);
 history.pairs[0].click();assert.equal(backClicks,0);
 back.disabled=false;history.observer.callback();history.pairs[0].click();assert.equal(backClicks,1);
 plugin.syncTabHistory();assert.equal(plugin.tabHistory,history);
 plugin.disposeTabHistory();assert.equal(history.nav.removed,true);assert.equal(Object.keys(back.attributes).length,0);assert.equal(Object.keys(history.pairs[0].button.listeners).length,0);assert.equal(observers.size,0);
 context.document.querySelector=oldQuery;context.document.createElement=oldCreate;
 const parent='20261108165649-jt8z12o',child='20261108165649-ezlarux';
 plugin.api=async(path,{id})=>path==='block/getBlockInfo'?{path:`/${parent}/${child}.sy`,box:'box'}:{name:id===parent?'研究生 / 同名 <标题>':'Matlab函数'};
 const result=await plugin.resolvePath(child);
 assert.equal(result.docs[0].id,parent);assert.equal(result.docs[0].name,'研究生 / 同名 <标题>');assert.equal(result.docs[1].id,child);
 plugin.api=async()=>({path:'/invalid.sy',box:'box'});
 await assert.rejects(()=>plugin.resolvePath(child));
 console.log('100 lifecycle/independent switch cycles, saved preferences, failed save, late load, event unsubscribe, ID mapping and invalid path tests passed.');
}
pathTests().catch(error=>{console.error(error);process.exitCode=1;});
