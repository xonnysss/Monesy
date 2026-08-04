import {
    type FormEvent,
    useState,
} from 'react'
import {
    Save,
    Trash2,
} from 'lucide-react'
import {
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import type { Customer } from '@/services/customerService'
import type { Product } from '@/services/productService'
import {
    createSale,
    type PaymentMethod,
    type SalePayload,
} from '@/services/saleService'

interface SaleFormProps {
    customers: Customer[]
    products: Product[]
}

interface SaleDetailDraft {
    producto: string
    cantidad: string
    descuento_unitario: string
}

const emptyDetail: SaleDetailDraft = {
    producto: '',
    cantidad: '1',
    descuento_unitario: '0.00',
}

function SaleForm({
    customers,
    products,
}: SaleFormProps) {
    const [details, setDetails] = useState<SaleDetailDraft[]>([
        emptyDetail,
    ])
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>('EFECTIVO')
    const [amountReceived, setAmountReceived] =
        useState('')

    const queryClient = useQueryClient()

    const saleMutation = useMutation({
        mutationFn: createSale,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['sales'],
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
        setDetails((currentDetails) => [
            ...currentDetails,
            emptyDetail,
        ])
    }

    function updateDetail(
        index: number,
        field: keyof SaleDetailDraft,
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

    function getProduct(productId: string) {
        return products.find(
            (product) => product.id === Number(productId),
        )
    }

    function getSubtotal(detail: SaleDetailDraft) {
        const product = getProduct(detail.producto)

        if (!product) {
            return 0
        }

        return (
            Number(product.precio_venta) -
            Number(detail.descuento_unitario || 0)
        ) * Number(detail.cantidad || 0)
    }

    const total = details.reduce(
        (sum, detail) => sum + getSubtotal(detail),
        0,
    )

    const change = paymentMethod === 'EFECTIVO'
        ? Math.max(Number(amountReceived || 0) - total, 0)
        : 0

    function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        const form = event.currentTarget
        const values = new FormData(form)
        const customerValue = String(
            values.get('cliente') ?? '',
        )

        const payload: SalePayload = {
            cliente: customerValue
                ? Number(customerValue)
                : null,
            metodo_pago: paymentMethod,
            monto_recibido: paymentMethod === 'EFECTIVO'
                ? amountReceived
                : total.toFixed(2),
            detalles: details.map((detail) => ({
                producto: Number(detail.producto),
                cantidad: Number(detail.cantidad),
                descuento_unitario:
                    detail.descuento_unitario,
            })),
        }

        saleMutation.mutate(payload, {
            onSuccess: () => {
                form.reset()
                setDetails([emptyDetail])
                setPaymentMethod('EFECTIVO')
                setAmountReceived('')
            },
        })
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-lg border bg-card p-4 text-card-foreground"
        >
            <h3 className="text-base font-semibold">
                Registrar venta
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                    Cliente

                    <select
                        name="cliente"
                        defaultValue=""
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none focus:border-blue-600"
                    >
                        <option value="">
                            Venta sin cliente
                        </option>

                        {customers.map((customer) => (
                            <option
                                key={customer.id}
                                value={customer.id}
                            >
                                {customer.nombre} - {customer.documento}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="text-sm font-medium">
                    Metodo de pago

                    <select
                        value={paymentMethod}
                        onChange={(event) =>
                            setPaymentMethod(
                                event.target.value as PaymentMethod,
                            )
                        }
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none focus:border-blue-600"
                    >
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="QR">QR</option>
                        <option value="TARJETA">Tarjeta</option>
                        <option value="TRANSFERENCIA">
                            Transferencia
                        </option>
                        <option value="OTRO">Otro</option>
                    </select>
                </label>

                {paymentMethod === 'EFECTIVO' && (
                    <label className="text-sm font-medium">
                        Monto recibido

                        <input
                            type="number"
                            value={amountReceived}
                            min="0"
                            step="0.01"
                            required
                            placeholder="0.00"
                            onChange={(event) =>
                                setAmountReceived(
                                    event.target.value,
                                )
                            }
                            className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-600"
                        />
                    </label>
                )}
            </div>

            <div className="mt-4 space-y-3">
                {details.map((detail, index) => {
                    const product = getProduct(detail.producto)

                    return (
                        <div
                            key={index}
                            className="grid gap-3 border p-3 md:grid-cols-[1fr_90px_110px_110px_120px_auto]"
                        >
                            <select
                                value={detail.producto}
                                required
                                onChange={(event) =>
                                    updateDetail(
                                        index,
                                        'producto',
                                        event.target.value,
                                    )
                                }
                                className="h-10 w-full border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-600"
                            >
                                <option value="" disabled>
                                    Selecciona un producto
                                </option>

                                {products.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.nombre} ({item.stock_actual} {item.unidad_medida_simbolo})
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                value={detail.cantidad}
                                min="1"
                                max={product?.stock_actual}
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

                            <p className="flex h-10 items-center justify-end border bg-muted px-3 text-sm">
                                Bs {product?.precio_venta ?? '0.00'}
                            </p>

                            <input
                                type="number"
                                value={detail.descuento_unitario}
                                min="0"
                                max={product?.precio_venta}
                                step="0.01"
                                required
                                aria-label={`Descuento de la linea ${index + 1}`}
                                onChange={(event) =>
                                    updateDetail(
                                        index,
                                        'descuento_unitario',
                                        event.target.value,
                                    )
                                }
                                className="h-10 w-full border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-600"
                            />

                            <p className="flex h-10 items-center justify-end border bg-muted px-3 text-sm font-medium">
                                Bs {getSubtotal(detail).toFixed(2)}
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
                    )
                })}
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
                <div className="text-right">
                    <p className="text-lg font-semibold">
                        Total: Bs {total.toFixed(2)}
                    </p>

                    {paymentMethod === 'EFECTIVO' && (
                        <p className="text-sm text-muted-foreground">
                            Cambio: Bs {change.toFixed(2)}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={
                        saleMutation.isPending ||
                        products.length === 0
                    }
                >
                    <Save className="h-4 w-4" />
                    {saleMutation.isPending
                        ? 'Registrando venta...'
                        : 'Registrar venta'}
                </Button>
            </div>

            {saleMutation.isError && (
                <p className="mt-3 text-sm text-destructive">
                    No se pudo registrar la venta. Revisa el turno,
                    stock y monto recibido.
                </p>
            )}
        </form>
    )
}

export default SaleForm