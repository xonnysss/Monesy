import api from './api'

export interface SalesByPaymentMethod {
    metodo_pago: string
    cantidad: number
    total: string
}

export interface TopProduct {
    producto_id: number
    codigo: string
    nombre: string
    cantidad: number
    total: string
}

export interface LowStockReportProduct {
    id: number
    codigo: string
    nombre: string
    stock_actual: number
    stock_minimo: number
}

export interface ReportSummary {
    fecha_inicio: string
    fecha_fin: string
    cantidad_ventas: number
    total_ventas: string
    cantidad_compras: number
    total_compras: string
    cantidad_devoluciones: number
    total_devoluciones: string
    ventas_netas: string
    ventas_por_metodo: SalesByPaymentMethod[]
    top_productos: TopProduct[]
    stock_bajo: LowStockReportProduct[]
}

export async function getReportSummary(
    fechaInicio: string,
    fechaFin: string,
): Promise<ReportSummary> {
    const response = await api.get<ReportSummary>(
        'reportes/resumen/',
        {
            params: {
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
            },
        },
    )

    return response.data
}
