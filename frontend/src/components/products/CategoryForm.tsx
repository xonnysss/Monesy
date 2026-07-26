import { useState, type FormEvent } from 'react'
import {
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createCategory } from '@/services/productService'

function CategoryForm() {
    const [categoryName, setCategoryName] = useState('')
    const queryClient = useQueryClient()

    const categoryMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            setCategoryName('')

            queryClient.invalidateQueries({
                queryKey: ['categories'],
            })
        },
    })

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const normalizedName = categoryName.trim()

        if (!normalizedName) {
            return
        }

        categoryMutation.mutate(normalizedName)
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-4 flex max-w-lg flex-wrap items-end gap-2"
        >
            <div className="min-w-0 flex-1">
                <label
                    htmlFor="category-name"
                    className="mb-1 block text-sm font-medium"
                >
                    Nueva categoria
                </label>

                <input
                    id="category-name"
                    type="text"
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="Ejemplo: Bebidas"
                    maxLength={120}
                    disabled={categoryMutation.isPending}
                    className="h-10 w-full border bg-white px-3 text-sm outline-none focus:border-blue-600 disabled:bg-slate-100"
                />
            </div>

            <Button
                type="submit"
                disabled={categoryMutation.isPending}
            >
                <Plus className="h-4 w-4" />
                {categoryMutation.isPending ? 'Guardando...' : 'Agregar'}
            </Button>

            {categoryMutation.isError && (
                <p className="w-full text-sm text-red-600">
                    No se pudo crear la categoria.
                </p>
            )}
        </form>
    )
}

export default CategoryForm