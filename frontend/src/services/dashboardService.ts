import api from './api'

export interface DashboardSummary {
    fecha: string
    productos_activos: number
    productos_stock_bajo: number
    clientes: number
    ventas_hoy: number
    total_ventas_hoy: string
    compras_hoy: number
    total_compras_hoy: string
    turnos_abiertos: number
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>(
        'dashboard/resumen/',
    )

    return response.data
}