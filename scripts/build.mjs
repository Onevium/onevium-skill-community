import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parseManifest} from './manifest.mjs';
const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'catalog');
const check=process.argv.includes('--check');
const releases=[];const seen=new Set();
for(const name of fs.readdirSync(path.join(root,'packages')).filter(n=>n.endsWith('.json')).sort()) {
 const raw=JSON.parse(fs.readFileSync(path.join(root,'packages',name),'utf8'));
 const manifest=parseManifest(raw.manifest);
 assert.match(manifest.version,/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,'Publish a stable semantic version');
 assert(!seen.has(manifest.id),'Duplicate package id');seen.add(manifest.id);
 assert.equal(name,manifest.id.replace('/','--')+'.json','File name must match publisher and package id');
 assert.equal(typeof raw.releaseNotes,'string');assert(raw.releaseNotes.length>0&&raw.releaseNotes.length<=8000);
 assert.equal(typeof raw.publishedAt,'string');assert(Number.isFinite(Date.parse(raw.publishedAt)));
 const digest=crypto.createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
 releases.push({manifest,digest,releaseNotes:raw.releaseNotes,publishedAt:raw.publishedAt});
}
assert(releases.length>0&&releases.length<=500);
const index={schemaVersion:1,releases};
const data=JSON.stringify(index,null,2)+'\n';assert(Buffer.byteLength(data)<=4_000_000);
if(!check)fs.mkdirSync(output,{recursive:true});
for(const release of releases) {
 const file=path.join(output,release.manifest.id.replace('/','--')+'-'+release.manifest.version+'.json');
 const text=JSON.stringify(release.manifest,null,2)+'\n';
 if(fs.existsSync(file))assert.equal(fs.readFileSync(file,'utf8'),text,'Published version is immutable; increment the version');
 if(!check)fs.writeFileSync(file,text);else assert(fs.existsSync(file),'Missing version artifact: run npm run build');
}
if(check)assert.equal(fs.readFileSync(path.join(output,'index.json'),'utf8'),data,'Catalog is stale: run npm run build');
else fs.writeFileSync(path.join(output,'index.json'),data);
console.log(`${check?'Verified':'Built'} ${releases.length} packages. No network, install scripts or model requests.`);
