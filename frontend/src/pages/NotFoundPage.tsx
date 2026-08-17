import { Link } from 'react-router'
import { Home, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

function NotFoundPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <section className="w-full max-w-md border bg-card p-6 text-center text-card-foreground">
                <Search className="mx-auto h-8 w-8 text-muted-foreground" />

                <h1 className="mt-4 text-xl font-semibold">
                    Pagina no encontrada
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    La direccion que escribiste no existe en Monesy.
                </p>

                <Button asChild className="mt-5">
                    <Link to="/">
                        <Home />
                        Ir al dashboard
                    </Link>
                </Button>
            </section>
        </main>
    )
}

export default NotFoundPage