import api from './api'

export interface Provider {
    id: number
    nombre: string
    telefono: string | null
    email: string | null
    direccion: string | null
    activo: boolean
    created_at: string
}

export interface ProviderPayload {
    nombre: string
    telefono: string
    email: string
    direccion: string
    activo: boolean
}

export async function getProviders(): Promise<Provider[]> {
    const response = await api.get<Provider[]>('proveedores/')

    return response.data
}

export async function createProvider(
    payload: ProviderPayload,
): Promise<Provider> {
    const response = await api.post<Provider>(
        'proveedores/',
        payload,
    )

    return response.data
}

export async function updateProvider(
    id: number,
    payload: ProviderPayload,
): Promise<Provider> {
    const response = await api.put<Provider>(
        `proveedores/${id}/`,
        payload,
    )

    return response.data
}