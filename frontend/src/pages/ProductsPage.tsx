import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/services/productService'

function ProductsPage() {
    const {
        data: products = [],
        isPending,
        isError,
    } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    })

    return (
        <section>
            <h2 className="text-2xl font-bold">Productos</h2>
            <p className="mt-2 text-slate-600">
                Aqui se administraran los productos, precios, categorias y stock.
            </p>

            {isPending && (
                <p className="mt-6">Cargando productos...</p>
            )}

            {isError && (
                <p className="mt-6 text-red-600">
                    No se pudieron cargar los productos.
                </p>
            )}

            {!isPending && !isError && products.length === 0 && (
                <p className="mt-6">
                    Todavia no hay productos registrados.
                </p>
            )}

            {products.length > 0 && (
                <p className="mt-6">
                    Productos cargados: {products.length}
                </p>
            )}

        </section>
    )
}

export default ProductsPage