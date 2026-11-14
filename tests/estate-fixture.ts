import * as T from 'three';
import {vi} from 'vitest';
const context=new Proxy({}, {get:()=>()=>{}});vi.stubGlobal('document',{createElement:()=>({width:0,height:0,getContext:()=>context})});
import {Estate} from '../src/world';
export function estateFixture(){const e=Object.create(Estate.prototype) as Estate;e.surfaces=[];e.scene=new T.Scene();e.camera=new T.PerspectiveCamera();e.targets=[];e.barriers=[];e.walls=[];e.actors=new Map();e.doors=new Map();e.mats={};for(const name of ['stone','trim','wood','plaster','slate','dark','panel','gold','cream','grass','gravel','red','paper','black','leaf','glass'])e.mats[name]=new T.MeshStandardMaterial({color:0x888888,side:T.DoubleSide});e.sign=()=>new T.Mesh();e.paper=()=>new T.Group();e.castle();return e}
export function furnishedEstate(){const e=estateFixture();e.interiors();e.garden();e.barrier(-18,4,.9,.9);e.barrier(12,7,.9,.9);e.barrier(18,7,.9,.9);return e}
