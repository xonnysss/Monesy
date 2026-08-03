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

                    <p className="mt-6 text-sm text-muted-foreground">
                        Compras registradas: {purchases.length}
                    </p>
                </>
            )}
        </section>
    )
}

export default PurchasesPage