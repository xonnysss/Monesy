import api from './api'

export interface ReturnDetail {
    id: number
    devolucion: number
    producto: number
    producto_nombre: string
    cantidad: number
    precio_unitario: string
    subtotal: string
}

export interface ReturnRecord {
    id: number
    venta: number
    venta_id: number
    venta_fecha: string
    usuario: number
    usuario_username: string
    fecha: string
    motivo: string | null
    total_devuelto: string
    detalles_registrados: ReturnDetail[]
}

export interface ReturnDetailPayload {
    producto: number
    cantidad: number
}

export interface ReturnPayload {
    venta: number
    motivo: string
    detalles: ReturnDetailPayload[]
}

export async function getReturns(): Promise<ReturnRecord[]> {
    const response = await api.get<ReturnRecord[]>('devoluciones/')

    return response.data
}

export async function createReturn(
    payload: ReturnPayload,
): Promise<ReturnRecord> {
    const response = await api.post<ReturnRecord>(
        'devoluciones/',
        payload,
    )

    return response.data
}
