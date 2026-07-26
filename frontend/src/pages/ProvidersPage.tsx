import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import ProviderForm from '@/components/providers/ProviderForm'
import {
    getProviders,
    type Provider,
} from '@/services/providerService'

function ProvidersPage() {
    const [selectedProvider, setSelectedProvider] =
        useState<Provider | null>(null)

    const {
        data: providers = [],
        isPending,
        isError,
    } = useQuery({
        queryKey: ['providers'],
        queryFn: getProviders,
    })

    return (
        <section>
            <h2 className="text-2xl font-bold">
                Proveedores
            </h2>

            <p className="mt-2 text-muted-foreground">
                Aqui se administraran los proveedores del minimarket.
            </p>

            {selectedProvider && (
                <p className="mt-4 text-sm text-blue-700 dark:text-blue-300">
                    Proveedor seleccionado: {selectedProvider.nombre}
                </p>
            )}

            <ProviderForm
                key={selectedProvider?.id ?? 'new'}
                provider={selectedProvider}
                onFinish={() => setSelectedProvider(null)}
            />

            {isPending && (
                <p className="mt-6">
                    Cargando proveedores...
                </p>
            )}

            {isError && (
                <p className="mt-6 text-destructive">
                    No se pudieron cargar los proveedores.
                </p>
            )}

            {!isPending && !isError && providers.length === 0 && (
                <p className="mt-6 text-muted-foreground">
                    Todavia no hay proveedores registrados.
                </p>
            )}

            {providers.length > 0 && (
                <div className="mt-6 overflow-x-auto border bg-card text-card-foreground">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/60 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">
                                    Proveedor
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Telefono
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Correo
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Direccion
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Estado
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {providers.map((provider) => (
                                <tr
                                    key={provider.id}
                                    className="hover:bg-muted/50"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {provider.nombre}
                                    </td>

                                    <td className="px-4 py-3">
                                        {provider.telefono || '-'}
                                    </td>

                                    <td className="px-4 py-3">
                                        {provider.email || '-'}
                                    </td>

                                    <td className="max-w-xs break-words px-4 py-3">
                                        {provider.direccion || '-'}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                provider.activo
                                                    ? 'text-emerald-700 dark:text-emerald-400'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            {provider.activo
                                                ? 'Activo'
                                                : 'Inactivo'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon-sm"
                                            onClick={() =>
                                                setSelectedProvider(provider)
                                            }
                                            aria-label={`Editar ${provider.nombre}`}
                                            title="Editar proveedor"
                                        >
                                            <Pencil />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}

export default ProvidersPage