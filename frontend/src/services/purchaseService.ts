import api from './api'

export interface PurchaseDetail {
    id: number
    compra: number
    producto: number
    producto_nombre: string
    cantidad: number
    precio_unitario: string
    subtotal: string
}

export interface Purchase {
    id: number
    proveedor: number
    proveedor_nombre: string
    usuario: number
    usuario_username: string
    fecha: string
    total: string
    detalles_registrados: PurchaseDetail[]
}

export interface PurchaseDetailPayload {
    producto: number
    cantidad: number
    precio_unitario: string
}

export interface PurchasePayload {
    proveedor: number
    detalles: PurchaseDetailPayload[]
}

export async function getPurchases(): Promise<Purchase[]> {
    const response = await api.get<Purchase[]>('compras/')

    return response.data
}

export async function createPurchase(
    payload: PurchasePayload,
): Promise<Purchase> {
    const response = await api.post<Purchase>(
        'compras/',
        payload,
    )

    return response.data
}