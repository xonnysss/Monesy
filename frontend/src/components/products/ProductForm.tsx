import type { FormEvent } from 'react'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import {
    createProduct,
    updateProduct,
    type Category,
    type ProductPayload,
    type Product,
    type UnitMeasure,
} from '@/services/productService'

interface ProductFormProps {
    product: Product | null
    categories: Category[]
    units: UnitMeasure[]
    onFinish: () => void
}

function ProductForm({
    product,
    categories,
    units,
    onFinish,
}: ProductFormProps) {
    const queryClient = useQueryClient()

    const productMutation = useMutation({
        mutationFn: (payload: ProductPayload) => {
            if (product) {
                return updateProduct(product.id, payload)
            }

            return createProduct(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['products'],
            })
        },
    })

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const form = event.currentTarget
        const values = new FormData(form)

        const payload: ProductPayload = {
            codigo: String(values.get('codigo')).trim(),
            nombre: String(values.get('nombre')).trim(),
            categoria: Number(values.get('categoria')),
            unidad_medida: Number(values.get('unidad_medida')),
            precio_venta: String(values.get('precio_venta')),
            precio_compra_ref: String(
                values.get('precio_compra_ref'),
            ),
            stock_minimo: Number(values.get('stock_minimo')),
            activo: values.has('activo'),
        }

        productMutation.mutate(payload, {
            onSuccess: () => {
                form.reset()
                onFinish()
            },
        })
    }
    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-lg border bg-card p-4 text-card-foreground"
        >
            <h3 className="text-base font-semibold">
                {product ? 'Editar producto' : 'Nuevo producto'}
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                    Codigo

                    <input
                        name="codigo"
                        type="text"
                        defaultValue={product?.codigo ?? ''}
                        required
                        maxLength={50}
                        placeholder="Ejemplo: BEB-001"
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-600"
                    />
                </label>

                <label className="text-sm font-medium">
                    Nombre

                    <input
                        name="nombre"
                        type="text"
                        defaultValue={product?.nombre ?? ''}
                        required
                        maxLength={180}
                        placeholder="Ejemplo: Agua mineral"
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-600"
                    />
                </label>

                <label className="text-sm font-medium">
                    Categoria

                    <select
                        name="categoria"
                        required
                        defaultValue={
                            product ? String(product.categoria) : ''
                        }

                        disabled={categories.length === 0}
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none focus:border-blue-600 disabled:bg-muted"
                    >
                        <option value="" disabled>
                            Selecciona una categoria
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.nombre}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="text-sm font-medium">
                    Unidad de medida

                    <select
                        name="unidad_medida"
                        required
                        defaultValue={
                            product ? String(product.unidad_medida) : ''
                        }

                        disabled={units.length === 0}
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none focus:border-blue-600 disabled:bg-muted"
                    >
                        <option value="" disabled>
                            Selecciona una unidad
                        </option>

                        {units.map((unit) => (
                            <option
                                key={unit.id}
                                value={unit.id}
                            >
                                {unit.nombre} ({unit.simbolo})
                            </option>
                        ))}
                    </select>
                </label>

                <label className="text-sm font-medium">
                    Precio de venta

                    <input
                        name="precio_venta"
                        type="number"
                        defaultValue={product?.precio_venta ?? ''}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-600"
                    />
                </label>

                <label className="text-sm font-medium">
                    Precio de compra referencial

                    <input
                        name="precio_compra_ref"
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        defaultValue={
                            product?.precio_compra_ref ?? '0.00'
                        }
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none focus:border-blue-600"
                    />
                </label>

                <label className="text-sm font-medium">
                    Stock minimo

                    <input
                        name="stock_minimo"
                        type="number"
                        required
                        min="0"
                        step="1"
                        defaultValue={product?.stock_minimo ?? 0}
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none focus:border-blue-600"
                    />
                </label>

                <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                        name="activo"
                        type="checkbox"
                        defaultChecked={product?.activo ?? true}
                        className="h-4 w-4 accent-blue-600"
                    />
                    Producto activo
                </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
                {product && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onFinish}
                    >
                        <X className="h-4 w-4" />
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={
                        productMutation.isPending ||
                        categories.length === 0 ||
                        units.length === 0
                    }
                >
                    <Save className="h-4 w-4" />
                    {productMutation.isPending
                        ? 'Guardando...'
                        : product
                            ? 'Actualizar producto'
                            : 'Guardar producto'}
                </Button>
            </div>

            {productMutation.isError && (
                <p className="mt-3 text-sm text-destructive">
                    No se puede guardar el producto
                </p>
            )}
        </form>
    )
}

export default ProductForm
