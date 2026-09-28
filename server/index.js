import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB } from '../lib/db.js';
import health from '../api/health.js';
import notes from '../api/notes.js';
import noteById from '../api/notes/[id].js';
import register from '../api/auth/register.js';
import login from '../api/auth/login.js';
import logout from '../api/auth/logout.js';
import me from '../api/auth/me.js';
import password from '../api/auth/password.js';
dotenv.config();
const app=express(); app.disable('x-powered-by');app.use(express.json({limit:'256kb'}));
const route=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
app.all('/api/health',route(health));
app.all('/api/auth/register',route(register));app.all('/api/auth/login',route(login));
app.all('/api/auth/logout',route(logout));app.all('/api/auth/me',route(me));
app.all('/api/auth/password',route(password));
app.all('/api/notes',route(notes));
app.all('/api/notes/:id',route(noteById));
app.use('/api',(req,res)=>res.status(404).json({error:'Endpoint not found.'}));
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
app.use(express.static(path.join(root,'dist')));
app.get('/{*path}',(req,res)=>res.sendFile(path.join(root,'dist','index.html')));
const port=Number(process.env.PORT)||3001;
try { await connectDB();app.listen(port,()=>console.log(`Notati listening on http://localhost:${port}`)); }
catch(error){console.error(`MongoDB connection failed: ${error.message}`);process.exitCode=1;}
