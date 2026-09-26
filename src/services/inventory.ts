import type { AppData, InventoryRecord, StockMovement } from '../types'

export class InventoryError extends Error {}
const key=(p:string,w:string,l:string)=>`${p}:${w}:${l}`
const clone=<T,>(x:T):T=>structuredClone(x)

export function validateOperation(source:AppData, operationId:string, userId='user-001', adminOverride=false):AppData {
  const data=clone(source)
  const op=data.operations.find(o=>o.id===operationId)
  if(!op) throw new InventoryError('Operation not found')
  if(op.status==='Done'||op.validatedAt) throw new InventoryError('This operation has already been validated')
  if(op.status==='Cancelled') throw new InventoryError('Cancelled operations cannot be validated')
  const ensure=(productId:string,warehouseId:string,locationId:string):InventoryRecord=>{
    let row=data.inventory.find(i=>key(i.productId,i.warehouseId,i.locationId)===key(productId,warehouseId,locationId))
    if(!row){row={id:crypto.randomUUID(),productId,warehouseId,locationId,quantity:0,reserved:0};data.inventory.push(row)}
    return row
  }
  const movements:StockMovement[]=[]
  for(const line of op.lines){
    const qty=op.type==='Adjustment'?line.processed:line.quantity
    if(qty<0) throw new InventoryError('Quantity cannot be negative')
    const sourceRow=ensure(line.productId,op.warehouseId,op.locationId)
    let delta=0
    if(op.type==='Receipt'){sourceRow.quantity+=qty;delta=qty}
    if(op.type==='Delivery'){
      if(!adminOverride && sourceRow.quantity-sourceRow.reserved<qty) throw new InventoryError('Insufficient available stock')
      sourceRow.quantity-=qty;delta=-qty
    }
    if(op.type==='Transfer'){
      if(!op.destinationWarehouseId||!op.destinationLocationId) throw new InventoryError('Transfer destination is required')
      if(op.warehouseId===op.destinationWarehouseId&&op.locationId===op.destinationLocationId) throw new InventoryError('Source and destination must be different')
      if(sourceRow.quantity-sourceRow.reserved<qty) throw new InventoryError('Insufficient stock at source')
      sourceRow.quantity-=qty
      const dest=ensure(line.productId,op.destinationWarehouseId,op.destinationLocationId);dest.quantity+=qty;delta=-qty
    }
    if(op.type==='Adjustment'){delta=qty-sourceRow.quantity;sourceRow.quantity=qty}
    movements.push({id:crypto.randomUUID(),date:new Date().toISOString(),reference:op.number,operationId:op.id,type:op.type,productId:line.productId,fromWarehouseId:op.type==='Delivery'||op.type==='Transfer'||op.type==='Adjustment'?op.warehouseId:undefined,fromLocationId:op.type==='Delivery'||op.type==='Transfer'||op.type==='Adjustment'?op.locationId:undefined,toWarehouseId:op.type==='Receipt'?op.warehouseId:op.type==='Transfer'?op.destinationWarehouseId:undefined,toLocationId:op.type==='Receipt'?op.locationId:op.type==='Transfer'?op.destinationLocationId:undefined,quantityIn:delta>0?delta:0,quantityOut:delta<0?Math.abs(delta):0,balanceAfter:op.type==='Transfer'?ensure(line.productId,op.destinationWarehouseId!,op.destinationLocationId!).quantity:sourceRow.quantity,userId})
  }
  op.status='Done';op.validatedAt=new Date().toISOString();data.ledger.unshift(...movements)
  data.notifications.unshift({id:crypto.randomUUID(),title:`${op.type} completed`,message:`${op.number} updated inventory successfully.`,kind:'success',read:false,createdAt:new Date().toISOString(),href:`/${op.type.toLowerCase()}s`})
  return data
}

export function addProduct(source:AppData,input:Omit<AppData['products'][number],'id'|'createdAt'> & {initialStock:number;warehouseId:string;locationId:string}):AppData {
  if(source.products.some(p=>p.sku.toLowerCase()===input.sku.toLowerCase())) throw new InventoryError('SKU must be unique')
  const data=clone(source); const id=crypto.randomUUID(); const createdAt=new Date().toISOString(); const {initialStock,warehouseId,locationId,...product}=input
  data.products.unshift({...product,id,createdAt}); data.inventory.push({id:crypto.randomUUID(),productId:id,warehouseId,locationId,quantity:initialStock,reserved:0})
  if(initialStock>0)data.ledger.unshift({id:crypto.randomUUID(),date:createdAt,reference:'INITIAL',type:'Initial Stock',productId:id,toWarehouseId:warehouseId,toLocationId:locationId,quantityIn:initialStock,quantityOut:0,balanceAfter:initialStock,userId:'user-001'})
  return data
}
