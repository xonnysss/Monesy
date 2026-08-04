import { useQuery } from '@tanstack/react-query'

import PurchaseForm from '@/components/purchases/PurchaseForm'
import {
    getProducts,
    type Product,
} from '@/services/productService'
import {
    getProviders,
    type Provider,
} from '@/services/providerService'
import { getPurchases } from '@/services/purchaseService'

function PurchasesPage() {
    const {
        data: products = [],
        isPending: areProductsPending,
        isError: hasProductsError,
    } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const {
        data: providers = [],
        isPending: areProvidersPending,
        isError: hasProvidersError,
    } = useQuery({
        queryKey: ['providers'],
        queryFn: getProviders,
    })

    const {
        data: purchases = [],
        isPending: arePurchasesPending,
        isError: hasPurchasesError,
    } = useQuery({
        queryKey: ['purchases'],
        queryFn: getPurchases,
    })

    const activeProducts: Product[] = products.filter(
        (product) => product.activo,
    )
    const activeProviders: Provider[] = providers.filter(
        (provider) => provider.activo,
    )

    const isPending = (
        areProductsPending ||
        areProvidersPending ||
        arePurchasesPending
    )

    const isError = (
        hasProductsError ||
        hasProvidersError ||
        hasPurchasesError
    )

    return (
        <section>
            <h2 className="text-2xl font-bold">Compras</h2>
            <p className="mt-2 text-muted-foreground">
                Registra las compras realizadas a proveedores y aumenta el stock.
            </p>

            {isPending && (
                <p className="mt-6">Cargando datos para compras...</p>
            )}

            {isError && (
                <p className="mt-6 text-destructive">
                    No se pudieron cargar los datos de compras.
                </p>
            )}

            {!isPending && !isError && (
                <>
                    <PurchaseForm
                        providers={activeProviders}
                        products={activeProducts}
                    />

                    {purchases.length === 0 ? (
                        <p className="mt-6">
                            Todavia no hay compras registradas.
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
                                            Proveedor
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Usuario
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Productos
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                                            Total
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {purchases.map((purchase) => (
                                        <tr
                                            key={purchase.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs">
                                                #{purchase.id}
                                            </td>

                                            <td className="px-4 py-3">
                                                {new Date(
                                                    purchase.fecha,
                                                ).toLocaleDateString('es-BO')}
                                            </td>

                                            <td className="px-4 py-3 font-medium">
                                                {purchase.proveedor_nombre}
                                            </td>

                                            <td className="px-4 py-3 text-muted-foreground">
                                                {purchase.usuario_username}
                                            </td>

                                            <td className="px-4 py-3">
                                                {
                                                    purchase.detalles_registrados.length
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-right font-medium">
                                                Bs {purchase.total}
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

export default PurchasesPage