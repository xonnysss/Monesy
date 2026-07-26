import { useQuery } from '@tanstack/react-query'
import {
    getCategories,
    getProducts,
    getUnits,
    type Product,
} from '@/services/productService'

import CategoryForm from '@/components/products/CategoryForm'
import ProductForm from '@/components/products/ProductForm'
import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ProductsPage() {

    const [
        selectedProduct,
        setSelectedProduct,
    ] = useState<Product | null>(null)

    const {
        data: products = [],
        isPending,
        isError,
    } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const {
        data: categories = [],
        isPending: areCategoriesPending,
    } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    })

    const {
        data: units = [],
        isPending: areUnitsPending,
    } = useQuery({
        queryKey: ['units'],
        queryFn: getUnits,
    })

    return (
        <section>
            <h2 className="text-2xl font-bold">Productos</h2>
            <p className="mt-2 text-muted-foreground">
                Aqui se administraran los productos, precios, categorias y stock.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
                Categorias disponibles:{' '}
                {areCategoriesPending ? 'Cargando...' : categories.length}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
                Unidades disponibles:{' '}
                {areUnitsPending ? 'Cargando...' : units.length}
            </p>

            <CategoryForm />
            {selectedProduct && (
                <p className="mt-4 text-sm text-blue-700 dark:text-blue-300">
                    Producto seleccionado: {selectedProduct.nombre}
                </p>
            )}
            <ProductForm
                key={selectedProduct?.id ?? 'new'}
                product={selectedProduct}
                categories={categories}
                units={units}
                onFinish={() => setSelectedProduct(null)}
            />

            {isPending && (
                <p className="mt-6">Cargando productos...</p>
            )}

            {isError && (
                <p className="mt-6 text-destructive">
                    No se pudieron cargar los productos.
                </p>
            )}

            {!isPending && !isError && products.length === 0 && (
                <p className="mt-6">
                    Todavia no hay productos registrados.
                </p>
            )}

            {products.length > 0 && (
                <div className="mt-6 overflow-x-auto border bg-card text-card-foreground">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/60 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Codigo</th>
                                <th className="px-4 py-3 font-medium">Producto</th>
                                <th className="px-4 py-3 font-medium">Categoria</th>
                                <th className="px-4 py-3 font-medium">Precio venta</th>
                                <th className="px-4 py-3 font-medium">Precio compra</th>
                                <th className="px-4 py-3 font-medium">Stock</th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {products.map((product) =>
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

                                    <td className="px-4 py-3">
                                        Bs {product.precio_venta}
                                    </td>

                                    <td className="px-4 py-3">
                                        Bs {product.precio_compra_ref}
                                    </td>

                                    <td className="px-4 py-3">
                                        {product.stock_actual}{' '}
                                        {product.unidad_medida_simbolo}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                product.activo
                                                    ? 'text-emerald-700 dark:text-emerald-400'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            {product.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon-sm"
                                            onClick={() => setSelectedProduct(product)}
                                            aria-label={`Editar ${product.nombre}`}
                                            title="Editar producto"
                                        >
                                            <Pencil />
                                        </Button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}

export default ProductsPage
