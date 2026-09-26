/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createSeedData } from '../data/seed'
import { addProduct as addProductService, validateOperation } from '../services/inventory'
import type { AppData, Category, Product, StockOperation, Warehouse, Location } from '../types'

const STORAGE='stocksense-demo-v1'
type ProductInput=Omit<Product,'id'|'createdAt'> & {initialStock:number;warehouseId:string;locationId:string}
interface StoreValue {data:AppData; authenticated:boolean; setAuthenticated:(v:boolean)=>void; toast:string; clearToast:()=>void; addProduct:(p:ProductInput)=>void; updateProduct:(p:Product)=>void; deleteProduct:(id:string)=>void; addOperation:(o:StockOperation)=>void; updateOperationStatus:(id:string,status:StockOperation['status'])=>void; validate:(id:string)=>void; upsertWarehouse:(v:Warehouse)=>void; upsertLocation:(v:Location)=>void; upsertCategory:(v:Category)=>void; archiveWarehouse:(id:string)=>void; markNotification:(id?:string)=>void; reset:()=>void; importData:(json:string)=>void; exportData:()=>string}
const Store=createContext<StoreValue|null>(null)

function initial(){try{const raw=localStorage.getItem(STORAGE);return raw?JSON.parse(raw) as AppData:createSeedData()}catch{return createSeedData()}}
export function AppStore({children}:{children:ReactNode}){
 const [data,setData]=useState<AppData>(initial); const [authenticated,setAuthenticatedState]=useState(()=>sessionStorage.getItem('stocksense-auth')==='1'); const [toast,setToast]=useState('')
 useEffect(()=>localStorage.setItem(STORAGE,JSON.stringify(data)),[data])
 const note=(s:string)=>{setToast(s);window.setTimeout(()=>setToast(''),3000)}
 const setAuthenticated=(v:boolean)=>{setAuthenticatedState(v);if(v)sessionStorage.setItem('stocksense-auth','1');else sessionStorage.removeItem('stocksense-auth')}
 const value=useMemo<StoreValue>(()=>({data,authenticated,setAuthenticated,toast,clearToast:()=>setToast(''),
  addProduct:p=>{setData(d=>addProductService(d,p));note('Product created')},
  updateProduct:p=>{setData(d=>({...d,products:d.products.map(x=>x.id===p.id?p:x)}));note('Product updated')},
  deleteProduct:id=>{setData(d=>({...d,products:d.products.filter(p=>p.id!==id),inventory:d.inventory.filter(i=>i.productId!==id)}));note('Product removed')},
  addOperation:o=>{setData(d=>({...d,operations:[o,...d.operations]}));note(`${o.type} ${o.number} created`)},
  updateOperationStatus:(id,status)=>setData(d=>({...d,operations:d.operations.map(o=>o.id===id?{...o,status}:o)})),
  validate:id=>{setData(d=>validateOperation(d,id));note('Inventory updated successfully')},
  upsertWarehouse:v=>{setData(d=>({...d,warehouses:d.warehouses.some(x=>x.id===v.id)?d.warehouses.map(x=>x.id===v.id?v:x):[v,...d.warehouses]}));note('Warehouse saved')},
  upsertLocation:v=>{setData(d=>({...d,locations:d.locations.some(x=>x.id===v.id)?d.locations.map(x=>x.id===v.id?v:x):[v,...d.locations]}));note('Location saved')},
  upsertCategory:v=>{setData(d=>({...d,categories:d.categories.some(x=>x.id===v.id)?d.categories.map(x=>x.id===v.id?v:x):[v,...d.categories]}));note('Category saved')},
  archiveWarehouse:id=>{setData(d=>({...d,warehouses:d.warehouses.map(w=>w.id===id?{...w,status:'Archived'}:w)}));note('Warehouse archived')},
  markNotification:id=>setData(d=>({...d,notifications:d.notifications.map(n=>!id||n.id===id?{...n,read:true}:n)})),
  reset:()=>{setData(createSeedData());note('Demo data reset')},
  importData:json=>{const parsed=JSON.parse(json) as AppData;if(!parsed.products||!parsed.inventory)throw new Error('Invalid StockSense file');setData(parsed);note('Demo data imported')},exportData:()=>JSON.stringify(data,null,2)}),[data,authenticated,toast])
 return <Store.Provider value={value}>{children}</Store.Provider>
}
export function useApp(){const v=useContext(Store);if(!v)throw new Error('useApp outside provider');return v}
