import type { Product } from '@/services/productService'
import type { Provider } from '@/services/providerService'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Trash2 } from 'lucide-react'
import {
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import {
    createPurchase,
    type PurchasePayload,
} from '@/services/purchaseService'

interface PurchaseFormProps {
    providers: Provider[]
    products: Product[]
}

interface PurchaseDetailDraft {
    producto: string
    cantidad: string
    precio_unitario: string
}

function PurchaseForm({
    providers,
    products,
}: PurchaseFormProps) {

    const [details, setDetails] = useState<PurchaseDetailDraft[]>([
        {
            producto: '',
            cantidad: '1',
            precio_unitario: '',
        },
    ])

    const queryClient = useQueryClient()

    const purchaseMutation = useMutation({
        mutationFn: createPurchase,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['purchases'],
            })
            queryClient.invalidateQueries({
                queryKey: ['products'],
            })
            queryClient.invalidateQueries({
                queryKey: ['dashboard-summary'],
            })
        },
    })

    function addDetail() {
        setDetails([
            ...details,
            {
                producto: '',
                cantidad: '1',
                precio_unitario: '',
            },
        ])
    }

    function updateDetail(
        index: number,
        field: keyof PurchaseDetailDraft,
        value: string,
    ) {
        setDetails((currentDetails) =>
            currentDetails.map((detail, detailIndex) =>
                detailIndex === index
                    ? { ...detail, [field]: value }
                    : detail,
            ),
        )
    }

    function selectProduct(
        index: number,
        productId: string,
    ) {
        const selectedProduct = products.find(
            (product) => product.id === Number(productId),
        )

        setDetails((currentDetails) =>
            currentDetails.map((detail, detailIndex) =>
                detailIndex === index
                    ? {
                        ...detail,
                        producto: productId,
                        precio_unitario:
                            selectedProduct?.precio_compra_ref ?? '',
                    }
                    : detail,
            ),
        )
    }

    function removeDetail(index: number) {
        if (details.length === 1) {
            return
        }

        setDetails((currentDetails) =>
            currentDetails.filter(
                (_, detailIndex) => detailIndex !== index,
            ),
        )
    }

    function getDetailSubtotal(
        detail: PurchaseDetailDraft,
    ) {
        return (
            Number(detail.cantidad || 0) *
            Number(detail.precio_unitario || 0)
        )
    }

    const total = details.reduce(
        (sum, detail) => sum + getDetailSubtotal(detail),
        0,
    )

    function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        const form = event.currentTarget
        const values = new FormData(form)

        const payload: PurchasePayload = {
            proveedor: Number(values.get('proveedor')),
            detalles: details.map((detail) => ({
                producto: Number(detail.producto),
                cantidad: Number(detail.cantidad),
                precio_unitario: detail.precio_unitario,
            })),
        }

        purchaseMutation.mutate(payload, {
            onSuccess: () => {
                form.reset()
                setDetails([
                    {
                        producto: '',
                        cantidad: '1',
                        precio_unitario: '',
                    },
                ])
            },
        })
    }


    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-lg border bg-card p-4 text-card-foreground">
            <h3 className="text-base font-semibold">
                Registrar compra
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                    Proveedor

                    <select
                        name="proveedor"
                        required
                        disabled={providers.length === 0}
                        defaultValue=""
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none focus:border-blue-600 disabled:bg-muted"
                    >
                        <option value="" disabled>
                            Selecciona un proveedor
                        </option>

                        {providers.map((provider) => (
                            <option
                                key={provider.id}
                                value={provider.id}
                            >
                                {provider.nombre}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="mt-4 space-y-3">
                {details.map((detail, index) => (
                    <div
                        key={index}
                        className="grid gap-3 border p-3 md:grid-cols-[1fr_120px_160px_120px_auto]"
                    >
                        <select
                            value={detail.producto}
                            required
                            onChange={(event) =>
                                selectProduct(
                                    index,
                                    event.target.value,
                                )
                            }
                            className="h-10 w-full border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-600"
                        >
                            <option value="" disabled>
                                Selecciona un producto
                            </option>

                            {products.map((product) => (
                                <option
                                    key={product.id}
                                    value={product.id}
                                >
                                    {product.nombre}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            value={detail.cantidad}
                            min="1"
                            step="1"
                            required
                            aria-label={`Cantidad de la linea ${index + 1}`}
                            onChange={(event) =>
                                updateDetail(
                                    index,
                                    'cantidad',
                                    event.target.value,
                                )
                            }
                            className="h-10 w-full border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-600"
                        />

                        <input
                            type="number"
                            value={detail.precio_unitario}
                            min="0.01"
                            step="0.01"
                            required
                            aria-label={`Precio de la linea ${index + 1}`}
                            onChange={(event) =>
                                updateDetail(
                                    index,
                                    'precio_unitario',
                                    event.target.value,
                                )
                            }
                            className="h-10 w-full border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-600"
                        />

                        <p className="flex h-10 items-center justify-end border bg-muted px-3 text-sm font-medium">
                            Bs {getDetailSubtotal(detail).toFixed(2)}
                        </p>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => removeDetail(index)}
                            disabled={details.length === 1}
                            aria-label={`Quitar linea ${index + 1}`}
                            title="Quitar producto"
                        >
                            <Trash2 />
                        </Button>
                    </div>
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={addDetail}
            >
                Agregar producto
            </Button>
            <div className="mt-4 flex items-center justify-end gap-4 border-t pt-4">
                <p className="text-lg font-semibold">
                    Total: Bs {total.toFixed(2)}
                </p>

                <Button
                    type="submit"
                    disabled={
                        purchaseMutation.isPending ||
                        providers.length === 0 ||
                        products.length === 0
                    }
                >
                    <Save className="h-4 w-4" />
                    {purchaseMutation.isPending
                        ? 'Registrando compra...'
                        : 'Registrar compra'}
                </Button>
            </div>

            {purchaseMutation.isError && (
                <p className="mt-3 text-sm text-destructive">
                    No se pudo registrar la compra.
                </p>
            )}
        </form>
    )
}
export default PurchaseForm