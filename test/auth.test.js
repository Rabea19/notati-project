import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, validateCredentials, tokenHash, checkOrigin } from '../lib/auth.js';
import { payload } from '../lib/payload.js';

test('password hashing uses a unique salt and verifies correctly',async()=>{
 const a=await hashPassword('a long example password');
 const b=await hashPassword('a long example password');
 assert.notEqual(a,b);assert.equal(await verifyPassword('a long example password',a),true);
 assert.equal(await verifyPassword('another password',a),false);
 assert.equal(await verifyPassword('anything','invalid'),false);
});
test('registration validates identity and password length',()=>{
 assert.throws(()=>validateCredentials({name:'A',email:'a@example.com',password:'short'},true),/12/);
 assert.deepEqual(validateCredentials({name:' A ',email:' A@Example.Com ',password:'twelvecharacters'},true),{name:'A',email:'a@example.com',password:'twelvecharacters'});
});
test('note payload ignores forged owner and cookie token is hashed',()=>{
 assert.deepEqual(payload({title:'Mine',owner:'other-user'}),{title:'Mine'});
 assert.notEqual(tokenHash('0123456789'), '0123456789');
});
test('cross origin mutation is rejected',()=>{
 let result;const res={status(n){result=n;return this},json(){return this}};
 assert.equal(checkOrigin({method:'POST',headers:{origin:'https://attacker.example',host:'notati.example'}},res),false);
 assert.equal(result,403);
});
