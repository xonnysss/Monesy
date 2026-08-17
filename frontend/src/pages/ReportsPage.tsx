import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    BarChart3,
    ShoppingBag,
    ShoppingCart,
    TrendingUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getReportSummary } from '@/services/reportService'

const paymentLabels: Record<string, string> = {
    EFECTIVO: 'Efectivo',
    QR: 'QR',
    TARJETA: 'Tarjeta',
    TRANSFERENCIA: 'Transferencia',
    OTRO: 'Otro',
}

function toDateInputValue(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function getInitialPeriod() {
    const today = new Date()

    return {
        fechaInicio: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
        fechaFin: toDateInputValue(today),
    }
}

function formatMoney(value: string) {
    return `Bs ${Number(value).toFixed(2)}`
}

function ReportsPage() {
    const initialPeriod = getInitialPeriod()
    const [fechaInicio, setFechaInicio] = useState(initialPeriod.fechaInicio)
    const [fechaFin, setFechaFin] = useState(initialPeriod.fechaFin)
    const [appliedPeriod, setAppliedPeriod] = useState(initialPeriod)
    const [formError, setFormError] = useState('')

    const {
        data,
        isPending,
        isError,
    } = useQuery({
        queryKey: [
            'report-summary',
            appliedPeriod.fechaInicio,
            appliedPeriod.fechaFin,
        ],
        queryFn: () => getReportSummary(
            appliedPeriod.fechaInicio,
            appliedPeriod.fechaFin,
        ),
    })

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (fechaInicio > fechaFin) {
            setFormError('La fecha de inicio no puede ser posterior a la fecha final.')
            return
        }

        setFormError('')
        setAppliedPeriod({ fechaInicio, fechaFin })
    }

    return (
        <section>
            <h2 className="text-2xl font-bold">Reportes</h2>
            <p className="mt-2 text-muted-foreground">
                Revisa ventas, compras, devoluciones y alertas de stock por periodo.
            </p>

            <form
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col gap-3 border bg-card p-4 text-card-foreground sm:flex-row sm:items-end"
            >
                <label className="block text-sm font-medium">
                    Desde
                    <input
                        type="date"
                        value={fechaInicio}
                        onChange={(event) => setFechaInicio(event.target.value)}
                        required
                        className="mt-1 block h-10 border bg-background px-3 font-normal outline-none focus:border-primary"
                    />
                </label>

                <label className="block text-sm font-medium">
                    Hasta
                    <input
                        type="date"
                        value={fechaFin}
                        onChange={(event) => setFechaFin(event.target.value)}
                        required
                        className="mt-1 block h-10 border bg-background px-3 font-normal outline-none focus:border-primary"
                    />
                </label>

                <Button type="submit">
                    <BarChart3 />
                    Actualizar reporte
                </Button>
            </form>

            {formError && (
                <p className="mt-3 text-sm text-destructive" role="alert">
                    {formError}
                </p>
            )}

            {isPending && (
                <p className="mt-6">Cargando reporte...</p>
            )}

            {isError && (
                <p className="mt-6 text-destructive">
                    No se pudo cargar el reporte para el periodo seleccionado.
                </p>
            )}

            {!isPending && !isError && data && (
                <>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Periodo consultado: {data.fecha_inicio} al {data.fecha_fin}
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="border bg-card p-4 text-card-foreground">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-sm">Ventas</span>
                                <ShoppingCart className="h-4 w-4" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold">
                                {formatMoney(data.total_ventas)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {data.cantidad_ventas} registradas
                            </p>
                        </div>

                        <div className="border bg-card p-4 text-card-foreground">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-sm">Devoluciones</span>
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold">
                                {formatMoney(data.total_devoluciones)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {data.cantidad_devoluciones} registradas
                            </p>
                        </div>

                        <div className="border bg-card p-4 text-card-foreground">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-sm">Ventas netas</span>
                                <BarChart3 className="h-4 w-4" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold">
                                {formatMoney(data.ventas_netas)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Ventas menos devoluciones
                            </p>
                        </div>

                        <div className="border bg-card p-4 text-card-foreground">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-sm">Compras</span>
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold">
                                {formatMoney(data.total_compras)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {data.cantidad_compras} registradas
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        <div className="overflow-x-auto border bg-card text-card-foreground">
                            <div className="border-b px-4 py-3">
                                <h3 className="font-semibold">Ventas por metodo de pago</h3>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/60 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Metodo</th>
                                        <th className="px-4 py-3 text-right font-medium">Ventas</th>
                                        <th className="px-4 py-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.ventas_por_metodo.map((item) => (
                                        <tr key={item.metodo_pago}>
                                            <td className="px-4 py-3">
                                                {paymentLabels[item.metodo_pago] ?? item.metodo_pago}
                                            </td>
                                            <td className="px-4 py-3 text-right">{item.cantidad}</td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {formatMoney(item.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {data.ventas_por_metodo.length === 0 && (
                                <p className="p-6 text-center text-sm text-muted-foreground">
                                    No hay ventas en este periodo.
                                </p>
                            )}
                        </div>

                        <div className="overflow-x-auto border bg-card text-card-foreground">
                            <div className="border-b px-4 py-3">
                                <h3 className="font-semibold">Productos mas vendidos</h3>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/60 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Producto</th>
                                        <th className="px-4 py-3 text-right font-medium">Cantidad</th>
                                        <th className="px-4 py-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.top_productos.map((product) => (
                                        <tr key={product.producto_id}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{product.nombre}</p>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {product.codigo}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-right">{product.cantidad}</td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {formatMoney(product.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {data.top_productos.length === 0 && (
                                <p className="p-6 text-center text-sm text-muted-foreground">
                                    No hay productos vendidos en este periodo.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 overflow-x-auto border bg-card text-card-foreground">
                        <div className="border-b px-4 py-3">
                            <h3 className="font-semibold">Productos con stock bajo</h3>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/60 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Codigo</th>
                                    <th className="px-4 py-3 font-medium">Producto</th>
                                    <th className="px-4 py-3 text-right font-medium">Actual</th>
                                    <th className="px-4 py-3 text-right font-medium">Minimo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.stock_bajo.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{product.codigo}</td>
                                        <td className="px-4 py-3 font-medium">{product.nombre}</td>
                                        <td className="px-4 py-3 text-right text-destructive">
                                            {product.stock_actual}
                                        </td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">
                                            {product.stock_minimo}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {data.stock_bajo.length === 0 && (
                            <p className="p-6 text-center text-sm text-muted-foreground">
                                No hay productos con stock bajo.
                            </p>
                        )}
                    </div>
                </>
            )}
        </section>
    )
}

export default ReportsPage
