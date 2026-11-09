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
  await p.onload();assert.equal(nodes.size,3);assert.equal(events.size,5);assert.equal(observers.size,1);
  await p.updatePreference('tree',false);assert.equal(nodes.size,2);assert.equal(events.size,5);
  await p.updatePreference('navigation',false);assert.equal(nodes.size,1);assert.equal(events.size,2);
  await p.updatePreference('navigation',true);assert.equal(nodes.size,2);assert.equal(events.size,5);
  await p.updatePreference('search',false);assert.equal(observers.size,0);assert.equal(events.size,3);
  await p.updatePreference('search',true);assert.equal(observers.size,1);assert.equal(events.size,5);
  p.onunload();assert.equal(nodes.size,0);assert.equal(events.size,0);assert.equal(observers.size,0);
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
 console.log('100 lifecycle/independent switch cycles, saved preferences, failed save, late load, event unsubscribe and search restoration tests passed.');
}
pathTests().catch(error=>{console.error(error);process.exitCode=1;});
