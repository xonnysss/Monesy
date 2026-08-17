import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    AlertTriangle,
    Boxes,
    Search,
    WalletCards,
} from 'lucide-react'

import {
    getInventorySummary,
    type InventoryStatus,
} from '@/services/inventoryService'

const statusLabels: Record<InventoryStatus, string> = {
    DISPONIBLE: 'Disponible',
    STOCK_BAJO: 'Stock bajo',
    SIN_STOCK: 'Sin stock',
    INACTIVO: 'Inactivo',
}

const statusClasses: Record<InventoryStatus, string> = {
    DISPONIBLE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    STOCK_BAJO: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    SIN_STOCK: 'bg-destructive/10 text-destructive',
    INACTIVO: 'bg-muted text-muted-foreground',
}

function formatMoney(value: string) {
    return `Bs ${Number(value).toFixed(2)}`
}

function InventoryPage() {
    const [search, setSearch] = useState('')
    const [onlyLowStock, setOnlyLowStock] = useState(false)

    const {
        data,
        isPending,
        isError,
    } = useQuery({
        queryKey: ['inventory-summary'],
        queryFn: getInventorySummary,
    })

    const products = useMemo(() => {
        if (!data) {
            return []
        }

        const normalizedSearch = search.trim().toLowerCase()

        return data.productos.filter((product) => {
            const matchesSearch = (
                !normalizedSearch ||
                product.codigo.toLowerCase().includes(normalizedSearch) ||
                product.nombre.toLowerCase().includes(normalizedSearch) ||
                product.categoria_nombre.toLowerCase().includes(normalizedSearch)
            )
            const hasLowStock = (
                product.estado === 'STOCK_BAJO' ||
                product.estado === 'SIN_STOCK'
            )

            return matchesSearch && (!onlyLowStock || hasLowStock)
        })
    }, [data, onlyLowStock, search])

    return (
        <section>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                    <h2 className="text-2xl font-bold">Inventario</h2>
                    <p className="mt-2 text-muted-foreground">
                        Consulta el stock disponible y detecta productos que requieren reposicion.
                    </p>
                </div>
            </div>

            {isPending && (
                <p className="mt-6">Cargando inventario...</p>
            )}

            {isError && (
                <p className="mt-6 text-destructive">
                    No se pudo cargar el resumen de inventario.
                </p>
            )}

            {!isPending && !isError && data && (
                <>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="border bg-card p-4 text-card-foreground">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-sm">Productos activos</span>
                                <Boxes className="h-4 w-4" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold">
                                {data.productos_activos}
                            </p>
                        </div>

                        <div className="border bg-card p-4 text-card-foreground">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-sm">Stock bajo</span>
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold">
                                {data.productos_stock_bajo}
                            </p>
                        </div>

                        <div className="border bg-card p-4 text-card-foreground">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-sm">Valor a costo</span>
                                <WalletCards className="h-4 w-4" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold">
                                {formatMoney(data.valor_stock_costo)}
                            </p>
                        </div>

                        <div className="border bg-card p-4 text-card-foreground">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-sm">Valor a venta</span>
                                <WalletCards className="h-4 w-4" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold">
                                {formatMoney(data.valor_stock_venta)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 border bg-card p-4 text-card-foreground sm:flex-row sm:items-center sm:justify-between">
                        <label className="relative block max-w-lg flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar por codigo, producto o categoria"
                                className="h-10 w-full border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
                            />
                        </label>

                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={onlyLowStock}
                                onChange={(event) => setOnlyLowStock(event.target.checked)}
                                className="h-4 w-4"
                            />
                            Solo stock bajo
                        </label>
                    </div>

                    <div className="mt-4 overflow-x-auto border bg-card text-card-foreground">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/60 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Codigo</th>
                                    <th className="px-4 py-3 font-medium">Producto</th>
                                    <th className="px-4 py-3 font-medium">Categoria</th>
                                    <th className="px-4 py-3 text-right font-medium">Stock actual</th>
                                    <th className="px-4 py-3 text-right font-medium">Stock minimo</th>
                                    <th className="px-4 py-3 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {product.codigo}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {product.nombre}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {product.categoria_nombre}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {product.stock_actual} {product.unidad_medida_simbolo}
                                        </td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">
                                            {product.stock_minimo} {product.unidad_medida_simbolo}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusClasses[product.estado]}`}>
                                                {statusLabels[product.estado]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {products.length === 0 && (
                            <p className="p-6 text-center text-sm text-muted-foreground">
                                No hay productos que coincidan con el filtro.
                            </p>
                        )}
                    </div>
                </>
            )}
        </section>
    )
}

export default InventoryPage
