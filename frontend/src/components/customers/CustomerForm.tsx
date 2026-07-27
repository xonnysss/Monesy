import type { FormEvent } from 'react'
import { Save, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import {
    createCustomer,
    updateCustomer,
    type Customer,
    type CustomerPayload,
} from '@/services/customerService'

interface CustomerFormProps {
    customer: Customer | null
    onFinish: () => void
}

function CustomerForm({
    customer,
    onFinish,
}: CustomerFormProps) {
    const queryClient = useQueryClient()

    const customerMutation = useMutation({
        mutationFn: (payload: CustomerPayload) => {
            if (customer) {
                return updateCustomer(customer.id, payload)
            }

            return createCustomer(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['customers'],
            })
        },
    })

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const form = event.currentTarget
        const values = new FormData(form)

        const payload: CustomerPayload = {
            documento: String(values.get('documento')).trim(),
            nombre: String(values.get('nombre')).trim(),
            telefono: String(values.get('telefono')).trim(),
        }

        customerMutation.mutate(payload, {
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
                {customer ? 'Editar cliente' : 'Nuevo cliente'}
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                    Documento

                    <input
                        name="documento"
                        type="text"
                        defaultValue={customer?.documento ?? ''}
                        required
                        maxLength={50}
                        placeholder="Ejemplo: 12345678"
                        className="mt-1 h-10 
                        w-full border bg-background px-3 font-normal 
                        text-foreground outline-none 
                        placeholder:text-muted-foreground 
                        focus:border-blue-600"
                    />
                </label>

                <label className="text-sm font-medium">
                    Nombre completo

                    <input
                        name="nombre"
                        type="text"
                        defaultValue={customer?.nombre ?? ''}
                        required
                        maxLength={150}
                        placeholder="Ejemplo: Ana Perez"
                        className="mt-1 h-10
                        w-full border bg-background px-3 font-normal 
                        text-foreground outline-none 
                        placeholder:text-muted-foreground 
                        focus:border-blue-600"
                    />
                </label>

                <label className="text-sm font-medium">
                    Telefono

                    <input
                        name="telefono"
                        type="tel"
                        defaultValue={customer?.telefono ?? ''}
                        maxLength={30}
                        placeholder="Ejemplo: 70000000"
                        className="mt-1 h-10
                        w-full border bg-background px-3 font-normal 
                        text-foreground outline-none 
                        placeholder:text-muted-foreground 
                        focus:border-blue-600"
                    />
                </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
                {customer && (
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
                    disabled={customerMutation.isPending}
                >
                    <Save className="h-4 w-4" />
                    {customerMutation.isPending
                        ? 'Guardando...'
                        : customer
                            ? 'Actualizar cliente'
                            : 'Guardar cliente'}
                </Button>
            </div>

            {customerMutation.isError && (
                <p className="mt-3 text-sm text-destructive">
                    No se pudo guardar el cliente
                </p>
            )}
        </form>
    )
}

export default CustomerForm