import {
    useEffect,
    useState,
    type ReactNode,
} from 'react'

import {
    ThemeContext,
    type Theme,
} from '@/contexts/ThemeContext'

const THEME_STORAGE_KEY = 'monesy_theme'

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({
    children,
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem(
            THEME_STORAGE_KEY,
        )

        if (
            savedTheme === 'light' ||
            savedTheme === 'dark' ||
            savedTheme === 'system'
        ) {
            return savedTheme
        }

        return 'system'
    })

    useEffect(() => {
        const root = document.documentElement

        root.classList.remove('light', 'dark')

        const systemTheme = window.matchMedia(
            '(prefers-color-scheme: dark)',
        ).matches
            ? 'dark'
            : 'light'

        root.classList.add(
            theme === 'system' ? systemTheme : theme,
        )
    }, [theme])

    function setTheme(newTheme: Theme) {
        localStorage.setItem(
            THEME_STORAGE_KEY,
            newTheme,
        )
        setThemeState(newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
