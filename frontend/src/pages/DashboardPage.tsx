import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '@/services/dashboardService'
import { Button } from '@/components/ui/button'
import {
    AlertTriangle,
    Banknote,
    Clock3,
    PackageCheck,
    ShoppingBasket,
    ShoppingCart,
    RefreshCw,
    Users,
    WalletCards,
} from 'lucide-react'

function DashboardPage() {
    const { data, isPending, isError, refetch } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: getDashboardSummary,
    })
    return (
        <section>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="mt-2 text-slate-600">
                Resumen general del minimarket: ventas, compras, stock y caja.
            </p>
            {isPending && <p className="mt-4">Cargando resumen...</p>}

            {data && (
                <p className="mt-1 text-sm text-slate-500">
                    Fecha del resumen: {data.fecha}
                </p>
            )}

            {isError && (
                <div className="mt-6 flex items-center justify-between gap-4 border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">
                        No se pudo cargar el resumen.
                    </p>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reintentar
                    </Button>
                </div>
            )}

            {data && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <article className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Productos activos
                            </p>

                            <PackageCheck className="h-5 w-5 text-blue-600" />
                        </div>

                        <p className="mt-2 text-2xl font-semibold">
                            {data.productos_activos}
                        </p>
                    </article>

                    <article className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Clientes
                            </p>

                            <Users className="h-5 w-5 text-cyan-700" />
                        </div>

                        <p className="mt-2 text-2xl font-semibold">
                            {data.clientes}
                        </p>
                    </article>

                    <article className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Stock bajo
                            </p>

                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>

                        <p className="mt-2 text-2xl font-semibold">
                            {data.productos_stock_bajo}
                        </p>
                    </article>

                    <article className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Ventas de hoy
                            </p>

                            <ShoppingCart className="h-5 w-5 text-emerald-600" />
                        </div>

                        <p className="mt-2 text-2xl font-semibold">
                            {data.ventas_hoy}
                        </p>
                    </article>

                    <article className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Total vendido hoy
                            </p>

                            <Banknote className="h-5 w-5 text-green-700" />
                        </div>

                        <p className="mt-2 text-2xl font-semibold">
                            {data.total_ventas_hoy}
                        </p>
                    </article>

                    <article className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Compras de hoy
                            </p>

                            <ShoppingBasket className="h-5 w-5 text-violet-600" />
                        </div>

                        <p className="mt-2 text-2xl font-semibold">
                            {data.compras_hoy}
                        </p>
                    </article>

                    <article className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Total comprado hoy
                            </p>

                            <WalletCards className="h-5 w-5 text-rose-600" />
                        </div>

                        <p className="mt-2 text-2xl font-semibold">
                            {data.total_compras_hoy}
                        </p>
                    </article>

                    <article className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Turnos abiertos
                            </p>

                            <Clock3 className="h-5 w-5 text-orange-600" />
                        </div>

                        <p className="mt-2 text-2xl font-semibold">
                            {data.turnos_abiertos}
                        </p>
                    </article>
                </div>
            )}
        </section>
    )
}

export default DashboardPage