export type Role = 'Admin' | 'Inventory Manager' | 'Warehouse Staff'
export type Status = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled'
export type MovementType = 'Receipt' | 'Delivery' | 'Transfer' | 'Adjustment' | 'Initial Stock'
export interface User { id:string; name:string; email:string; role:Role; warehouseId?:string; avatar?:string }
export interface Category { id:string; name:string }
export interface Warehouse { id:string; name:string; code:string; address:string; manager:string; status:'Active'|'Archived' }
export interface Location { id:string; warehouseId:string; name:string; code:string; capacity?:number; status:'Active'|'Archived' }
export interface Product { id:string; name:string; sku:string; barcode?:string; categoryId:string; unit:string; cost:number; price?:number; reorderLevel:number; description?:string; createdAt:string }
export interface InventoryRecord { id:string; productId:string; warehouseId:string; locationId:string; quantity:number; reserved:number }
export interface OperationLine { id:string; productId:string; quantity:number; processed:number }
export interface StockOperation { id:string; number:string; type:Exclude<MovementType,'Initial Stock'>; party:string; warehouseId:string; locationId:string; destinationWarehouseId?:string; destinationLocationId?:string; date:string; status:Status; reference?:string; notes?:string; reason?:string; lines:OperationLine[]; createdAt:string; validatedAt?:string }
export interface StockMovement { id:string; date:string; reference:string; operationId?:string; type:MovementType; productId:string; fromWarehouseId?:string; fromLocationId?:string; toWarehouseId?:string; toLocationId?:string; quantityIn:number; quantityOut:number; balanceAfter:number; userId:string }
export interface AppNotification { id:string; title:string; message:string; kind:'low'|'out'|'pending'|'error'|'success'; read:boolean; createdAt:string; href?:string }
export interface AppData { version:number; users:User[]; categories:Category[]; warehouses:Warehouse[]; locations:Location[]; products:Product[]; inventory:InventoryRecord[]; operations:StockOperation[]; ledger:StockMovement[]; notifications:AppNotification[] }
