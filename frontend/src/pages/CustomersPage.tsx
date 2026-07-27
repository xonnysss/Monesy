import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import CustomerForm from '@/components/customers/CustomerForm'
import {
    getCustomers,
    type Customer,
} from '@/services/customerService'

function CustomersPage() {
    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null)

    const {
        data: customers = [],
        isPending,
        isError,
    } = useQuery({
        queryKey: ['customers'],
        queryFn: getCustomers,
    })

    return (
        <section>
            <h2 className="text-2xl font-bold">
                Clientes
            </h2>

            <p className="mt-2 text-muted-foreground">
                Aqui se administraran los clientes del minimarket.
            </p>

            {selectedCustomer && (
                <p className="mt-4 text-sm text-blue-700 dark:text-blue-300">
                    Cliente seleccionado: {selectedCustomer.nombre}
                </p>
            )}

            <CustomerForm
                key={selectedCustomer?.id ?? 'new'}
                customer={selectedCustomer}
                onFinish={() => setSelectedCustomer(null)}
            />

            {isPending && (
                <p className="mt-6">
                    Cargando clientes...
                </p>
            )}

            {isError && (
                <p className="mt-6 text-destructive">
                    No se pudieron cargar los clientes.
                </p>
            )}

            {!isPending && !isError && customers.length === 0 && (
                <p className="mt-6 text-muted-foreground">
                    Todavia no hay clientes registrados.
                </p>
            )}

            {customers.length > 0 && (
                <div className="mt-6 overflow-x-auto border bg-card text-card-foreground">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/60 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">
                                    Documento
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Cliente
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Telefono
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {customers.map((customer) => (
                                <tr
                                    key={customer.id}
                                    className="hover:bg-muted/50"
                                >
                                    <td className="px-4 py-3 font-mono text-xs">
                                        {customer.documento}
                                    </td>

                                    <td className="px-4 py-3 font-medium">
                                        {customer.nombre}
                                    </td>

                                    <td className="px-4 py-3">
                                        {customer.telefono || '-'}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon-sm"
                                            onClick={() =>
                                                setSelectedCustomer(customer)
                                            }
                                            aria-label={`Editar ${customer.nombre}`}
                                            title="Editar cliente"
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

export default CustomersPage