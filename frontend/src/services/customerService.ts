import api from './api'

export interface Customer {
    id: number
    documento: string
    nombre: string
    telefono: string | null
    created_at: string
}

export interface CustomerPayload {
    documento: string
    nombre: string
    telefono: string
}

export async function getCustomers(): Promise<Customer[]> {
    const response = await api.get<Customer[]>('clientes/')

    return response.data
}

export async function createCustomer(
    payload: CustomerPayload,
): Promise<Customer> {
    const response = await api.post<Customer>(
        'clientes/',
        payload,
    )

    return response.data
}

export async function updateCustomer(
    id: number,
    payload: CustomerPayload,
): Promise<Customer> {
    const response = await api.put<Customer>(
        `clientes/${id}/`,
        payload,
    )

    return response.data
}