import api from './api'

export type PaymentMethod =
    | 'EFECTIVO'
    | 'QR'
    | 'TARJETA'
    | 'TRANSFERENCIA'
    | 'OTRO'

export interface SaleDetail {
    id: number
    venta: number
    producto: number
    producto_nombre: string
    cantidad: number
    precio_unitario: string
    descuento_unitario: string
    subtotal: string
}

export interface Sale {
    id: number
    cliente: number | null
    cliente_nombre: string | null
    cajero: number
    cajero_username: string
    turno: number
    fecha: string
    metodo_pago: PaymentMethod
    total: string
    monto_recibido: string
    cambio: string
    detalles_registrados: SaleDetail[]
}

export interface SaleDetailPayload {
    producto: number
    cantidad: number
    descuento_unitario: string
}

export interface SalePayload {
    cliente: number | null
    metodo_pago: PaymentMethod
    monto_recibido: string
    detalles: SaleDetailPayload[]
}

export async function getSales(): Promise<Sale[]> {
    const response = await api.get<Sale[]>('ventas/')

    return response.data
}

export async function createSale(
    payload: SalePayload,
): Promise<Sale> {
    const response = await api.post<Sale>(
        'ventas/',
        payload,
    )

    return response.data
}