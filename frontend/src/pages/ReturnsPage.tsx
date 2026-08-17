import { useMemo, useState, type FormEvent } from 'react'
import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { RotateCcw, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getSales } from '@/services/saleService'
import {
    createReturn,
    getReturns,
    type ReturnPayload,
} from '@/services/returnService'

function formatMoney(value: string) {
    return `Bs ${Number(value).toFixed(2)}`
}

function formatDate(value: string) {
    return new Date(value).toLocaleString('es-BO')
}

function ReturnsPage() {
    const queryClient = useQueryClient()
    const [selectedSaleId, setSelectedSaleId] = useState('')
    const [quantities, setQuantities] = useState<Record<number, string>>({})
    const [reason, setReason] = useState('')
    const [formError, setFormError] = useState('')

    const {
        data: sales = [],
        isPending: areSalesPending,
        isError: hasSalesError,
    } = useQuery({
        queryKey: ['sales'],
        queryFn: getSales,
    })

    const {
        data: returns = [],
        isPending: areReturnsPending,
        isError: hasReturnsError,
    } = useQuery({
        queryKey: ['returns'],
        queryFn: getReturns,
    })

    const selectedSale = sales.find(
        (sale) => sale.id === Number(selectedSaleId),
    )

    const returnedQuantities = useMemo(() => {
        if (!selectedSale) {
            return {}
        }

        return returns
            .filter((returnRecord) => returnRecord.venta === selectedSale.id)
            .flatMap((returnRecord) => returnRecord.detalles_registrados)
            .reduce<Record<number, number>>((totals, detail) => {
                totals[detail.producto] = (
                    (totals[detail.producto] ?? 0) + detail.cantidad
                )

                return totals
            }, {})
    }, [returns, selectedSale])

    const returnMutation = useMutation({
        mutationFn: createReturn,
        onSuccess: () => {
            setQuantities({})
            setReason('')
            setFormError('')
            queryClient.invalidateQueries({ queryKey: ['returns'] })
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-summary'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
            queryClient.invalidateQueries({ queryKey: ['cash-status'] })
            queryClient.invalidateQueries({ queryKey: ['report-summary'] })
        },
    })

    function selectSale(saleId: string) {
        setSelectedSaleId(saleId)
        setQuantities({})
        setFormError('')
    }

    function updateQuantity(productId: number, value: string) {
        setQuantities((current) => ({
            ...current,
            [productId]: value,
        }))
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!selectedSale) {
            setFormError('Selecciona una venta antes de registrar la devolucion.')
            return
        }

        const details = selectedSale.detalles_registrados
            .map((detail) => ({
                producto: detail.producto,
                cantidad: Number(quantities[detail.producto] ?? 0),
            }))
            .filter((detail) => detail.cantidad > 0)

        if (details.length === 0) {
            setFormError('Ingresa al menos una cantidad para devolver.')
            return
        }

        const payload: ReturnPayload = {
            venta: selectedSale.id,
            motivo: reason,
            detalles: details,
        }

        setFormError('')
        returnMutation.mutate(payload)
    }

    const isPending = areSalesPending || areReturnsPending
    const isError = hasSalesError || hasReturnsError

    return (
        <section>
            <h2 className="text-2xl font-bold">Devoluciones</h2>
            <p className="mt-2 text-muted-foreground">
                Registra productos devueltos, devuelve su stock y conserva el historial de la venta.
            </p>

            {isPending && (
                <p className="mt-6">Cargando ventas y devoluciones...</p>
            )}

            {isError && (
                <p className="mt-6 text-destructive">
                    No se pudieron cargar los datos de devoluciones.
                </p>
            )}

            {!isPending && !isError && (
                <>
                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 border bg-card p-4 text-card-foreground"
                    >
                        <div className="flex items-center gap-2">
                            <RotateCcw className="h-5 w-5" />
                            <h3 className="font-semibold">Registrar devolucion</h3>
                        </div>

                        <label className="mt-4 block max-w-2xl text-sm font-medium">
                            Venta original
                            <select
                                value={selectedSaleId}
                                required
                                onChange={(event) => selectSale(event.target.value)}
                                disabled={sales.length === 0}
                                className="mt-1 h-10 w-full border bg-background px-3 font-normal outline-none focus:border-primary disabled:bg-muted"
                            >
                                <option value="" disabled>
                                    Selecciona una venta
                                </option>
                                {sales.map((sale) => (
                                    <option key={sale.id} value={sale.id}>
                                        #{sale.id} - {formatDate(sale.fecha)} - {formatMoney(sale.total)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {sales.length === 0 && (
                            <p className="mt-3 text-sm text-muted-foreground">
                                Aun no hay ventas desde las cuales registrar una devolucion.
                            </p>
                        )}

                        {selectedSale && (
                            <>
                                <div className="mt-4 overflow-x-auto border">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b bg-muted/60 text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Producto</th>
                                                <th className="px-4 py-3 text-right font-medium">Vendido</th>
                                                <th className="px-4 py-3 text-right font-medium">Devuelto</th>
                                                <th className="px-4 py-3 text-right font-medium">Disponible</th>
                                                <th className="px-4 py-3 text-right font-medium">Cantidad a devolver</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedSale.detalles_registrados.map((detail) => {
                                                const returned = returnedQuantities[detail.producto] ?? 0
                                                const available = detail.cantidad - returned

                                                return (
                                                    <tr key={detail.producto}>
                                                        <td className="px-4 py-3 font-medium">
                                                            {detail.producto_nombre}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">{detail.cantidad}</td>
                                                        <td className="px-4 py-3 text-right">{returned}</td>
                                                        <td className="px-4 py-3 text-right font-medium">{available}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <input
                                                                type="number"
                                                                value={quantities[detail.producto] ?? ''}
                                                                min="0"
                                                                max={available}
                                                                step="1"
                                                                disabled={available === 0}
                                                                aria-label={`Cantidad a devolver de ${detail.producto_nombre}`}
                                                                onChange={(event) => updateQuantity(
                                                                    detail.producto,
                                                                    event.target.value,
                                                                )}
                                                                className="h-9 w-28 border bg-background px-2 text-right outline-none focus:border-primary disabled:bg-muted"
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <label className="mt-4 block max-w-2xl text-sm font-medium">
                                    Motivo
                                    <textarea
                                        value={reason}
                                        onChange={(event) => setReason(event.target.value)}
                                        rows={2}
                                        placeholder="Opcional"
                                        className="mt-1 w-full resize-y border bg-background px-3 py-2 font-normal outline-none focus:border-primary"
                                    />
                                </label>

                                <Button
                                    type="submit"
                                    className="mt-4"
                                    disabled={returnMutation.isPending}
                                >
                                    <Save />
                                    {returnMutation.isPending
                                        ? 'Registrando devolucion...'
                                        : 'Registrar devolucion'}
                                </Button>
                            </>
                        )}

                        {(formError || returnMutation.isError) && (
                            <p className="mt-3 text-sm text-destructive" role="alert">
                                {formError || 'No se pudo registrar la devolucion. Revisa las cantidades disponibles.'}
                            </p>
                        )}
                    </form>

                    <div className="mt-6 overflow-x-auto border bg-card text-card-foreground">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/60 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Nro.</th>
                                    <th className="px-4 py-3 font-medium">Fecha</th>
                                    <th className="px-4 py-3 font-medium">Venta</th>
                                    <th className="px-4 py-3 font-medium">Usuario</th>
                                    <th className="px-4 py-3 font-medium">Productos</th>
                                    <th className="px-4 py-3 text-right font-medium">Total devuelto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {returns.map((returnRecord) => (
                                    <tr key={returnRecord.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-mono text-xs">#{returnRecord.id}</td>
                                        <td className="px-4 py-3">{formatDate(returnRecord.fecha)}</td>
                                        <td className="px-4 py-3">#{returnRecord.venta_id}</td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {returnRecord.usuario_username}
                                        </td>
                                        <td className="px-4 py-3">
                                            {returnRecord.detalles_registrados.length}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {formatMoney(returnRecord.total_devuelto)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {returns.length === 0 && (
                            <p className="p-6 text-center text-sm text-muted-foreground">
                                Todavia no hay devoluciones registradas.
                            </p>
                        )}
                    </div>
                </>
            )}
        </section>
    )
}

export default ReturnsPage
