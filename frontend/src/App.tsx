import { Button } from '@/components/ui/button'

function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold text-blue-700">Monesy</h1>
      <p className="mt-2 text-slate-600">
        Frontend conectado con React, Vite, Tailwind y shadcn/ui.
      </p>

      <Button className="mt-4">Probar shadcn/ui</Button>
    </main>
  )
}

export default App