import api from './api'

export type InventoryStatus =
    | 'DISPONIBLE'
    | 'STOCK_BAJO'
    | 'SIN_STOCK'
    | 'INACTIVO'

export interface InventoryProduct {
    id: number
    codigo: string
    nombre: string
    categoria_nombre: string
    unidad_medida_simbolo: string
    stock_actual: number
    stock_minimo: number
    activo: boolean
    estado: InventoryStatus
}

export interface InventorySummary {
    total_productos: number
    productos_activos: number
    productos_stock_bajo: number
    valor_stock_costo: string
    valor_stock_venta: string
    productos: InventoryProduct[]
}

export async function getInventorySummary(): Promise<InventorySummary> {
    const response = await api.get<InventorySummary>(
        'inventario/resumen/',
    )

    return response.data
}
