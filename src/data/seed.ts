import type {
  AppData,
  Category,
  InventoryRecord,
  Location,
  Product,
  StockMovement,
  StockOperation,
  Warehouse,
} from '../types'

const uid = (prefix: string, n: number) => `${prefix}-${String(n).padStart(3, '0')}`
const now = new Date('2026-09-26T10:00:00.000Z')
const isoDaysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString()

export function createSeedData(): AppData {
  const categories: Category[] = [
    'Raw Materials',
    'Finished Goods',
    'Packaging',
    'Tools',
    'Electronics',
    'Furniture',
  ].map((name, i) => ({ id: uid('cat', i + 1), name }))
  const warehouses: Warehouse[] = [
    {
      id: 'wh-001',
      name: 'Main Warehouse',
      code: 'MAIN',
      address: '12 Industrial Avenue',
      manager: 'Adithri',
      status: 'Active',
    },
    {
      id: 'wh-002',
      name: 'Secondary Warehouse',
      code: 'SEC',
      address: '48 Logistics Park',
      manager: 'Priya Shah',
      status: 'Active',
    },
    {
      id: 'wh-003',
      name: 'Production Floor',
      code: 'PROD',
      address: 'Plant 2, Assembly Wing',
      manager: 'Daniel Kim',
      status: 'Active',
    },
  ]
  const locationNames = [
    ['Rack A', 'Rack B', 'Rack C', 'Receiving', 'Dispatch'],
    ['Zone 1', 'Zone 2', 'Bulk Storage'],
    ['Line Store', 'Assembly Bay', 'Quality Hold'],
  ]
  const locations: Location[] = locationNames.flatMap((names, w) =>
    names.map((name, i) => ({
      id: `loc-${w + 1}-${i + 1}`,
      warehouseId: warehouses[w].id,
      name,
      code: `${warehouses[w].code}-${i + 1}`,
      capacity: 1000 + i * 500,
      status: 'Active' as const,
    })),
  )
  const names = [
    'Steel Rod',
    'Aluminium Sheet',
    'Office Chair',
    'Packaging Box',
    'Safety Gloves',
    'Bearing Assembly',
    'Electrical Cable',
    'Fastener Set',
    'Motor Housing',
    'Control Module',
    'Copper Tube',
    'Hydraulic Pump',
    'Pallet Wrap',
    'Cutting Disc',
    'Relay Switch',
    'Work Bench',
    'Gear Assembly',
    'Sensor Module',
    'Rubber Gasket',
    'Industrial Paint',
    'Shipping Pallet',
    'Torque Wrench',
    'LED Panel',
    'Desk Unit',
    'Polymer Resin',
    'Valve Body',
    'Circuit Board',
    'Protective Helmet',
    'Machine Bolt',
    'Label Roll',
  ]
  const units = ['kg', 'sheet', 'unit', 'box', 'pair', 'unit', 'meter', 'set', 'unit', 'unit']
  const products: Product[] = names.map((name, i) => ({
    id: uid('prod', i + 1),
    name,
    sku: `SS-${String(1001 + i)}`,
    barcode: i % 3 === 0 ? `890${String(1000000000 + i)}` : undefined,
    categoryId: categories[i % categories.length].id,
    unit: units[i % units.length],
    cost: 12 + ((i * 7.35) % 390),
    price: 20 + ((i * 11.5) % 590),
    reorderLevel: 10 + (i % 5) * 8,
    description: `Operational stock item: ${name}.`,
    createdAt: isoDaysAgo(120 - i),
  }))
  const inventory: InventoryRecord[] = products.flatMap((p, i) => {
    const count = i % 4 === 0 ? 2 : 1
    return Array.from({ length: count }, (_, j) => {
      const w = (i + j) % 3
      return {
        id: `inv-${i}-${j}`,
        productId: p.id,
        warehouseId: warehouses[w].id,
        locationId: locations.find((l) => l.warehouseId === warehouses[w].id)!.id,
        quantity: i % 11 === 0 ? 0 : 8 + ((i * 23 + j * 17) % 170),
        reserved: i % 11 === 0 ? 0 : i % 5 === 0 ? 5 : 0,
      }
    })
  })
  const operations: StockOperation[] = []
  const pushOps = (type: StockOperation['type'], count: number, prefix: string) => {
    for (let i = 0; i < count; i++) {
      const w = i % 3
      operations.push({
        id: `op-${type.toLowerCase()}-${i}`,
        number: `${prefix}-${String(31 + i).padStart(4, '0')}`,
        type,
        party:
          type === 'Receipt'
            ? ['Atlas Steel', 'Nova Components', 'PackRight'][i % 3]
            : type === 'Delivery'
              ? ['Northstar Retail', 'Apex Works', 'Urban Office'][i % 3]
              : 'Internal',
        warehouseId: warehouses[w].id,
        locationId: locations.find((l) => l.warehouseId === warehouses[w].id)!.id,
        destinationWarehouseId: type === 'Transfer' ? warehouses[(w + 1) % 3].id : undefined,
        destinationLocationId:
          type === 'Transfer'
            ? locations.find((l) => l.warehouseId === warehouses[(w + 1) % 3].id)!.id
            : undefined,
        date: isoDaysAgo(i + 1),
        status: i < Math.floor(count * 0.55) ? 'Done' : i % 3 === 0 ? 'Ready' : 'Waiting',
        lines: [
          {
            id: uid('line', i),
            productId: products[(i * 3 + (type === 'Delivery' ? 2 : 0)) % products.length].id,
            quantity: 10 + ((i * 7) % 70),
            processed: 10 + ((i * 7) % 70),
          },
        ],
        createdAt: isoDaysAgo(i + 2),
        validatedAt: i < Math.floor(count * 0.55) ? isoDaysAgo(i + 1) : undefined,
      })
    }
  }
  pushOps('Receipt', 15, 'REC')
  pushOps('Delivery', 15, 'DEL')
  pushOps('Transfer', 8, 'TRF')
  pushOps('Adjustment', 8, 'ADJ')
  const ledger: StockMovement[] = operations
    .filter((o) => o.status === 'Done')
    .map((o, i) => {
      const line = o.lines[0]
      const inv = inventory.find((x) => x.productId === line.productId)
      return {
        id: uid('mov', i),
        date: o.validatedAt!,
        reference: o.number,
        operationId: o.id,
        type: o.type,
        productId: line.productId,
        fromWarehouseId:
          o.type === 'Delivery' || o.type === 'Transfer' || o.type === 'Adjustment'
            ? o.warehouseId
            : undefined,
        fromLocationId:
          o.type === 'Delivery' || o.type === 'Transfer' || o.type === 'Adjustment'
            ? o.locationId
            : undefined,
        toWarehouseId:
          o.type === 'Receipt'
            ? o.warehouseId
            : o.type === 'Transfer'
              ? o.destinationWarehouseId
              : undefined,
        toLocationId:
          o.type === 'Receipt'
            ? o.locationId
            : o.type === 'Transfer'
              ? o.destinationLocationId
              : undefined,
        quantityIn: o.type === 'Receipt' || o.type === 'Adjustment' ? line.quantity : 0,
        quantityOut: o.type === 'Delivery' || o.type === 'Transfer' ? line.quantity : 0,
        balanceAfter: inv?.quantity ?? 0,
        userId: 'user-001',
      }
    })
  return {
    version: 1,
    users: [
      {
        id: 'user-001',
        name: 'Adithri',
        email: 'admin@stocksense.demo',
        role: 'Admin',
        warehouseId: 'wh-001',
      },
    ],
    categories,
    warehouses,
    locations,
    products,
    inventory,
    operations,
    ledger,
    notifications: [
      {
        id: 'note-1',
        title: 'Low stock detected',
        message: 'Safety Gloves is below its reorder level.',
        kind: 'low',
        read: false,
        createdAt: isoDaysAgo(0),
        href: '/products',
      },
      {
        id: 'note-2',
        title: 'Receipt ready',
        message: 'REC-0042 is ready to validate.',
        kind: 'pending',
        read: false,
        createdAt: isoDaysAgo(1),
        href: '/receipts',
      },
      {
        id: 'note-3',
        title: 'Delivery completed',
        message: 'DEL-0038 was completed successfully.',
        kind: 'success',
        read: true,
        createdAt: isoDaysAgo(2),
        href: '/deliveries',
      },
    ],
  }
}
