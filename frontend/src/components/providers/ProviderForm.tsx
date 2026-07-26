import type { FormEvent } from 'react'
import { Save, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import {
    createProvider,
    updateProvider,
    type Provider,
    type ProviderPayload,
} from '@/services/providerService'

interface ProviderFormProps {
    provider: Provider | null
    onFinish: () => void
}

function ProviderForm({
    provider,
    onFinish,
}: ProviderFormProps) {
    const queryClient = useQueryClient()

    const providerMutation = useMutation({
        mutationFn: (payload: ProviderPayload) => {
            if (provider) {
                return updateProvider(provider.id, payload)
            }

            return createProvider(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['providers'],
            })
        },
    })

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const form = event.currentTarget
        const values = new FormData(form)

        const payload: ProviderPayload = {
            nombre: String(values.get('nombre')).trim(),
            telefono: String(values.get('telefono')).trim(),
            email: String(values.get('email')).trim(),
            direccion: String(values.get('direccion')).trim(),
            activo: values.has('activo'),
        }

        providerMutation.mutate(payload, {
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
                {provider ? 'Editar proveedor' : 'Nuevo proveedor'}
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                    Nombre

                    <input
                        name="nombre"
                        type="text"
                        defaultValue={provider?.nombre ?? ''}
                        required
                        maxLength={150}
                        placeholder="Ejemplo: Distribuidora Central"
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-600"
                    />
                </label>

                <label className="text-sm font-medium">
                    Telefono

                    <input
                        name="telefono"
                        type="tel"
                        defaultValue={provider?.telefono ?? ''}
                        maxLength={30}
                        placeholder="Ejemplo: 70000000"
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-600"
                    />
                </label>

                <label className="text-sm font-medium">
                    Correo electronico

                    <input
                        name="email"
                        type="email"
                        defaultValue={provider?.email ?? ''}
                        maxLength={150}
                        placeholder="Ejemplo: ventas@proveedor.com"
                        className="mt-1 h-10 w-full border bg-background px-3 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-600"
                    />
                </label>

                <label className="text-sm font-medium md:col-span-2">
                    Direccion

                    <textarea
                        name="direccion"
                        defaultValue={provider?.direccion ?? ''}
                        rows={3}
                        placeholder="Ejemplo: Av. Banzer, Santa Cruz"
                        className="mt-1 w-full resize-y border bg-background px-3 py-2 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-600"
                    />
                </label>

                <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                        name="activo"
                        type="checkbox"
                        defaultChecked={provider?.activo ?? true}
                        className="h-4 w-4 accent-blue-600"
                    />
                    Proveedor activo
                </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
                {provider && (
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
                    disabled={providerMutation.isPending}
                >
                    <Save className="h-4 w-4" />
                    {providerMutation.isPending
                        ? 'Guardando...'
                        : provider
                            ? 'Actualizar proveedor'
                            : 'Guardar proveedor'}
                </Button>
            </div>

            {providerMutation.isError && (
                <p className="mt-3 text-sm text-destructive">
                    No se pudo guardar el proveedor.
                </p>
            )}
        </form>
    )
}
export default ProviderForm