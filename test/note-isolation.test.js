import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Session from '../lib/session.js';
import Note from '../lib/note.js';
import listHandler from '../api/notes.js';
import itemHandler from '../api/notes/[id].js';
import { tokenHash } from '../lib/auth.js';
const owner = new mongoose.Types.ObjectId();
const noteId = new mongoose.Types.ObjectId();
const cookieToken='a'.repeat(64);
function response(){return {code:0,body:null,status(n){this.code=n;return this},json(x){this.body=x;return this},end(){return this},setHeader(){return this}};}
function request(method,path='/api/notes',body={}){return {method,url:path,headers:{host:'notati.example',origin:'https://notati.example',cookie:`notati_session=${cookieToken}`},body,query:{id:String(noteId)}};}

test('GET notes includes current owner and no other account',async t=>{
 const previous=mongoose.connection.readyState;mongoose.connection.readyState=1;
 t.after(()=>{mongoose.connection.readyState=previous});
 t.mock.method(Session,'findOne',(query)=>{
   assert.equal(query.tokenHash,tokenHash(cookieToken));
   return {populate:async()=>({user:{_id:owner,name:'Owner',email:'owner@example.com'}})};
 });
 t.mock.method(Note,'find',filter=>{
   assert.equal(String(filter.owner),String(owner));
   return {sort:()=>({lean:async()=>[{title:'My note'}]})};
 });
 const res=response();await listHandler(request('GET'),res);
 assert.equal(res.code,200);assert.equal(res.body[0].title,'My note');
});

test('PATCH and DELETE require both owner and note ID; another account gets 404',async t=>{
 const previous=mongoose.connection.readyState;mongoose.connection.readyState=1;
 t.after(()=>{mongoose.connection.readyState=previous});
 t.mock.method(Session,'findOne',()=>({populate:async()=>({user:{_id:owner}})}));
 t.mock.method(Note,'findOneAndUpdate',(filter,data)=>{
   assert.equal(String(filter.owner),String(owner));assert.equal(String(filter._id),String(noteId));
   assert.equal(data.owner,undefined);return null;
 });
 t.mock.method(Note,'findOneAndDelete',filter=>{
   assert.equal(String(filter.owner),String(owner));assert.equal(String(filter._id),String(noteId));return null;
 });
 const patched=response();await itemHandler(request('PATCH',`/api/notes/${noteId}`,{title:'Changed',owner:'attacker'}),patched);
 assert.equal(patched.code,404);
 const deleted=response();await itemHandler(request('DELETE',`/api/notes/${noteId}`),deleted);
 assert.equal(deleted.code,404);
});

test('signed-out users cannot list notes',async t=>{
 const previous=mongoose.connection.readyState;mongoose.connection.readyState=1;
 t.after(()=>{mongoose.connection.readyState=previous});
 const res=response();await listHandler({method:'GET',headers:{host:'notati.example'}},res);
 assert.equal(res.code,401);
});
