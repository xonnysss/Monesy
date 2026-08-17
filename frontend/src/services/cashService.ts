import api from './api'

export interface CashShift {
    id: number
    usuario: number
    usuario_username: string
    fecha_apertura: string
    fecha_cierre: string | null
    monto_inicial: string
    monto_final_real: string | null
    monto_final_sistema: string | null
    diferencia: string | null
    observacion: string | null
}

export interface CashStatus {
    turno_abierto: boolean
    turno: CashShift | null
    monto_esperado: string
}

export interface OpenCashShiftPayload {
    monto_inicial: string
    observacion: string
}

export interface CloseCashShiftPayload {
    monto_final_real: string
    observacion: string
}

export async function getCashStatus(): Promise<CashStatus> {
    const response = await api.get<CashStatus>('caja/estado/')

    return response.data
}

export async function getCashShifts(): Promise<CashShift[]> {
    const response = await api.get<CashShift[]>('turnos-caja/')

    return response.data
}

export async function openCashShift(
    payload: OpenCashShiftPayload,
): Promise<CashShift> {
    const response = await api.post<CashShift>(
        'caja/abrir/',
        payload,
    )

    return response.data
}

export async function closeCashShift(
    payload: CloseCashShiftPayload,
): Promise<CashShift> {
    const response = await api.post<CashShift>(
        'caja/cerrar/',
        payload,
    )

    return response.data
}
