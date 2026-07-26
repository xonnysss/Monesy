import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const systemUsesDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
    ).matches

    const isDark =
        theme === 'dark' ||
        (theme === 'system' && systemUsesDark)

    function toggleTheme() {
        setTheme(isDark ? 'light' : 'dark')
    }

    const accessibleLabel = isDark
        ? 'Activar modo claro'
        : 'Activar modo oscuro'

    return (
        <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label={accessibleLabel}
            title={accessibleLabel}
        >
            {isDark ? <Sun /> : <Moon />}
        </Button>
    )
}