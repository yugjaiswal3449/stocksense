import { describe,expect,it } from 'vitest'
import { createSeedData } from '../data/seed'
import type { StockOperation } from '../types'
import { validateOperation } from './inventory'

const setup=(type:StockOperation['type'],quantity:number,processed=quantity)=>{
 const data=createSeedData(); const inv=data.inventory.find(i=>i.quantity>100)!; const before=inv.quantity
 const op:StockOperation={id:'test-op',number:'TEST-001',type,party:'Test',warehouseId:inv.warehouseId,locationId:inv.locationId,destinationWarehouseId:type==='Transfer'?'wh-002':undefined,destinationLocationId:type==='Transfer'?'loc-2-1':undefined,date:new Date().toISOString(),status:'Ready',lines:[{id:'line',productId:inv.productId,quantity,processed}],createdAt:new Date().toISOString()}; data.operations.push(op);return {data,inv,before}
}
describe('inventory engine',()=>{
 it('receipt +50 increases stock',()=>{const {data,inv,before}=setup('Receipt',50);expect(validateOperation(data,'test-op').inventory.find(i=>i.id===inv.id)?.quantity).toBe(before+50)})
 it('delivery -10 decreases stock',()=>{const {data,inv,before}=setup('Delivery',10);expect(validateOperation(data,'test-op').inventory.find(i=>i.id===inv.id)?.quantity).toBe(before-10)})
 it('transfer preserves company total',()=>{const {data,inv}=setup('Transfer',20);const total=data.inventory.filter(i=>i.productId===inv.productId).reduce((s,i)=>s+i.quantity,0);const next=validateOperation(data,'test-op');expect(next.inventory.filter(i=>i.productId===inv.productId).reduce((s,i)=>s+i.quantity,0)).toBe(total)})
 it('adjustment 100 to 97 records -3',()=>{const {data,inv}=setup('Adjustment',100,97);inv.quantity=100;const next=validateOperation(data,'test-op');expect(next.inventory.find(i=>i.id===inv.id)?.quantity).toBe(97);expect(next.ledger[0].quantityOut).toBe(3)})
 it('prevents double validation',()=>{const {data}=setup('Receipt',50);const next=validateOperation(data,'test-op');expect(()=>validateOperation(next,'test-op')).toThrow(/already/)})
 it('prevents over-delivery',()=>{const {data,inv}=setup('Delivery',9999);inv.quantity=5;expect(()=>validateOperation(data,'test-op')).toThrow(/Insufficient/)})
 it('cancelled operation has no impact',()=>{const {data}=setup('Receipt',50);data.operations.at(-1)!.status='Cancelled';expect(()=>validateOperation(data,'test-op')).toThrow(/Cancelled/)})
})
