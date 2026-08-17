import { useState, type FormEvent } from 'react'
import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import {
    Banknote,
    LockKeyhole,
    UnlockKeyhole,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    closeCashShift,
    getCashShifts,
    getCashStatus,
    openCashShift,
} from '@/services/cashService'

function formatMoney(value: string | null) {
    if (value === null) {
        return '-'
    }

    return `Bs ${Number(value).toFixed(2)}`
}

function formatDate(value: string | null) {
    if (value === null) {
        return '-'
    }

    return new Date(value).toLocaleString('es-BO')
}

function differenceClass(value: string | null) {
    if (value === null || Number(value) === 0) {
        return 'text-muted-foreground'
    }

    return Number(value) > 0
        ? 'text-emerald-700 dark:text-emerald-400'
        : 'text-destructive'
}

function CashPage() {
    const queryClient = useQueryClient()
    const [openingAmount, setOpeningAmount] = useState('')
    const [openingNote, setOpeningNote] = useState('')
    const [closingAmount, setClosingAmount] = useState('')
    const [closingNote, setClosingNote] = useState('')

    const {
        data: cashStatus,
        isPending: isCashStatusPending,
        isError: hasCashStatusError,
    } = useQuery({
        queryKey: ['cash-status'],
        queryFn: getCashStatus,
    })

    const {
        data: shifts = [],
        isPending: areShiftsPending,
        isError: hasShiftsError,
    } = useQuery({
        queryKey: ['cash-shifts'],
        queryFn: getCashShifts,
    })

    function refreshCashData() {
        queryClient.invalidateQueries({ queryKey: ['cash-status'] })
        queryClient.invalidateQueries({ queryKey: ['cash-shifts'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }

    const openMutation = useMutation({
        mutationFn: openCashShift,
        onSuccess: () => {
            setOpeningAmount('')
            setOpeningNote('')
            refreshCashData()
        },
    })

    const closeMutation = useMutation({
        mutationFn: closeCashShift,
        onSuccess: () => {
            setClosingAmount('')
            setClosingNote('')
            refreshCashData()
        },
    })

    function handleOpenSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        openMutation.mutate({
            monto_inicial: openingAmount,
            observacion: openingNote,
        })
    }

    function handleCloseSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        closeMutation.mutate({
            monto_final_real: closingAmount,
            observacion: closingNote,
        })
    }

    const isPending = isCashStatusPending || areShiftsPending
    const isError = hasCashStatusError || hasShiftsError

    return (
        <section>
            <h2 className="text-2xl font-bold">Caja</h2>
            <p className="mt-2 text-muted-foreground">
                Abre y cierra tu turno de caja con un monto controlado por el sistema.
            </p>

            {isPending && (
                <p className="mt-6">Cargando estado de caja...</p>
            )}

            {isError && (
                <p className="mt-6 text-destructive">
                    No se pudieron cargar los datos de caja.
                </p>
            )}

            {!isPending && !isError && cashStatus && (
                <>
                    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <div className="border bg-card p-5 text-card-foreground">
                            <div className="flex items-center gap-2">
                                {cashStatus.turno_abierto ? (
                                    <UnlockKeyhole className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <LockKeyhole className="h-5 w-5 text-muted-foreground" />
                                )}
                                <h3 className="font-semibold">
                                    {cashStatus.turno_abierto
                                        ? 'Turno abierto'
                                        : 'Caja cerrada'}
                                </h3>
                            </div>

                            {cashStatus.turno_abierto && cashStatus.turno ? (
                                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm text-muted-foreground">Apertura</dt>
                                        <dd className="mt-1 font-medium">
                                            {formatDate(cashStatus.turno.fecha_apertura)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-muted-foreground">Monto inicial</dt>
                                        <dd className="mt-1 font-medium">
                                            {formatMoney(cashStatus.turno.monto_inicial)}
                                        </dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm text-muted-foreground">Monto esperado ahora</dt>
                                        <dd className="mt-1 text-2xl font-semibold">
                                            {formatMoney(cashStatus.monto_esperado)}
                                        </dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Registra el efectivo con el que inicia tu turno para habilitar las ventas.
                                </p>
                            )}
                        </div>

                        {cashStatus.turno_abierto ? (
                            <form
                                onSubmit={handleCloseSubmit}
                                className="border bg-card p-5 text-card-foreground"
                            >
                                <div className="flex items-center gap-2">
                                    <LockKeyhole className="h-5 w-5" />
                                    <h3 className="font-semibold">Cerrar turno</h3>
                                </div>

                                <label className="mt-4 block text-sm font-medium">
                                    Monto contado en caja
                                    <input
                                        type="number"
                                        value={closingAmount}
                                        min="0"
                                        step="0.01"
                                        required
                                        onChange={(event) => setClosingAmount(event.target.value)}
                                        placeholder="0.00"
                                        className="mt-1 h-10 w-full border bg-background px-3 font-normal outline-none focus:border-primary"
                                    />
                                </label>

                                <label className="mt-4 block text-sm font-medium">
                                    Observacion
                                    <textarea
                                        value={closingNote}
                                        onChange={(event) => setClosingNote(event.target.value)}
                                        rows={2}
                                        placeholder="Opcional"
                                        className="mt-1 w-full resize-y border bg-background px-3 py-2 font-normal outline-none focus:border-primary"
                                    />
                                </label>

                                <Button
                                    type="submit"
                                    className="mt-4"
                                    disabled={closeMutation.isPending}
                                >
                                    <LockKeyhole />
                                    {closeMutation.isPending ? 'Cerrando turno...' : 'Cerrar turno'}
                                </Button>

                                {closeMutation.isError && (
                                    <p className="mt-3 text-sm text-destructive" role="alert">
                                        No se pudo cerrar la caja. Verifica el monto contado e intenta nuevamente.
                                    </p>
                                )}
                            </form>
                        ) : (
                            <form
                                onSubmit={handleOpenSubmit}
                                className="border bg-card p-5 text-card-foreground"
                            >
                                <div className="flex items-center gap-2">
                                    <Banknote className="h-5 w-5" />
                                    <h3 className="font-semibold">Abrir turno</h3>
                                </div>

                                <label className="mt-4 block text-sm font-medium">
                                    Monto inicial
                                    <input
                                        type="number"
                                        value={openingAmount}
                                        min="0"
                                        step="0.01"
                                        required
                                        onChange={(event) => setOpeningAmount(event.target.value)}
                                        placeholder="0.00"
                                        className="mt-1 h-10 w-full border bg-background px-3 font-normal outline-none focus:border-primary"
                                    />
                                </label>

                                <label className="mt-4 block text-sm font-medium">
                                    Observacion
                                    <textarea
                                        value={openingNote}
                                        onChange={(event) => setOpeningNote(event.target.value)}
                                        rows={2}
                                        placeholder="Opcional"
                                        className="mt-1 w-full resize-y border bg-background px-3 py-2 font-normal outline-none focus:border-primary"
                                    />
                                </label>

                                <Button
                                    type="submit"
                                    className="mt-4"
                                    disabled={openMutation.isPending}
                                >
                                    <UnlockKeyhole />
                                    {openMutation.isPending ? 'Abriendo turno...' : 'Abrir turno'}
                                </Button>

                                {openMutation.isError && (
                                    <p className="mt-3 text-sm text-destructive" role="alert">
                                        No se pudo abrir la caja. Puede que ya exista un turno abierto.
                                    </p>
                                )}
                            </form>
                        )}
                    </div>

                    <div className="mt-6 overflow-x-auto border bg-card text-card-foreground">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/60 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Turno</th>
                                    <th className="px-4 py-3 font-medium">Usuario</th>
                                    <th className="px-4 py-3 font-medium">Apertura</th>
                                    <th className="px-4 py-3 font-medium">Cierre</th>
                                    <th className="px-4 py-3 text-right font-medium">Sistema</th>
                                    <th className="px-4 py-3 text-right font-medium">Contado</th>
                                    <th className="px-4 py-3 text-right font-medium">Diferencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {shifts.map((shift) => (
                                    <tr key={shift.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-mono text-xs">#{shift.id}</td>
                                        <td className="px-4 py-3 font-medium">{shift.usuario_username}</td>
                                        <td className="px-4 py-3">{formatDate(shift.fecha_apertura)}</td>
                                        <td className="px-4 py-3">{formatDate(shift.fecha_cierre)}</td>
                                        <td className="px-4 py-3 text-right">
                                            {formatMoney(shift.monto_final_sistema)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatMoney(shift.monto_final_real)}
                                        </td>
                                        <td className={`px-4 py-3 text-right font-medium ${differenceClass(shift.diferencia)}`}>
                                            {formatMoney(shift.diferencia)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {shifts.length === 0 && (
                            <p className="p-6 text-center text-sm text-muted-foreground">
                                Todavia no hay turnos de caja registrados.
                            </p>
                        )}
                    </div>
                </>
            )}
        </section>
    )
}

export default CashPage
