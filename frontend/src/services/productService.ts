import api from './api'

export interface Product {
    id: number
    codigo: string
    nombre: string
    categoria: number
    categoria_nombre: string
    unidad_medida: number
    unidad_medida_nombre: string
    unidad_medida_simbolo: string
    precio_venta: string
    precio_compra_ref: string
    stock_actual: number
    stock_minimo: number
    activo: boolean
    created_at: string
}

export interface Category {
    id: number
    nombre: string
    created_at: string
}

export interface UnitMeasure {
    id: number
    nombre: string
    simbolo: string
}

export async function getProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('productos/')

    return response.data
}

export async function getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('categorias/')

    return response.data
}

export async function getUnits(): Promise<UnitMeasure[]> {
    const response = await api.get<UnitMeasure[]>('unidades-medida/')

    return response.data
}