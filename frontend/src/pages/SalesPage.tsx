import { useQuery } from '@tanstack/react-query'

import SaleForm from '@/components/sales/SaleForm'
import { getCustomers } from '@/services/customerService'
import { getProducts } from '@/services/productService'
import { getSales } from '@/services/saleService'

function SalesPage() {
    const {
        data: products = [],
        isPending: areProductsPending,
        isError: hasProductsError,
    } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const {
        data: customers = [],
        isPending: areCustomersPending,
        isError: hasCustomersError,
    } = useQuery({
        queryKey: ['customers'],
        queryFn: getCustomers,
    })

    const {
        data: sales = [],
        isPending: areSalesPending,
        isError: hasSalesError,
    } = useQuery({
        queryKey: ['sales'],
        queryFn: getSales,
    })

    const availableProducts = products.filter(
        (product) =>
            product.activo &&
            product.stock_actual > 0,
    )

    const isPending = (
        areProductsPending ||
        areCustomersPending ||
        areSalesPending
    )

    const isError = (
        hasProductsError ||
        hasCustomersError ||
        hasSalesError
    )

    return (
        <section>
            <h2 className="text-2xl font-bold">Ventas</h2>
            <p className="mt-2 text-muted-foreground">
                Registra ventas, descuenta stock y calcula el cambio.
            </p>

            {isPending && (
                <p className="mt-6">
                    Cargando datos para ventas...
                </p>
            )}

            {isError && (
                <p className="mt-6 text-destructive">
                    No se pudieron cargar los datos de ventas.
                </p>
            )}

            {!isPending && !isError && (
                <>
                    <SaleForm
                        customers={customers}
                        products={availableProducts}
                    />

                    {sales.length === 0 ? (
                        <p className="mt-6">
                            Todavia no hay ventas registradas.
                        </p>
                    ) : (
                        <div className="mt-6 overflow-x-auto border bg-card text-card-foreground">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/60 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Nro.
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Fecha
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Cliente
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Pago
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Cajero
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Total
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {sales.map((sale) => (
                                        <tr
                                            key={sale.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs">
                                                #{sale.id}
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(
                                                    sale.fecha,
                                                ).toLocaleDateString('es-BO')}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {sale.cliente_nombre ??
                                                    'Sin cliente'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {sale.metodo_pago}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {sale.cajero_username}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                Bs {sale.total}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </section>
    )
}

export default SalesPage