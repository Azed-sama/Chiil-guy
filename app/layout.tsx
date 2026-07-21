import type { Metadata, Viewport } from 'next'
import { Fraunces, Manrope, IBM_Plex_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from 'sonner'
import { getSiteSettings } from '@/lib/data/settings'
import './globals.css'

const fontDisplay = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const fontSans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: {
      default: settings.storeName,
      template: `%s | ${settings.storeName}`,
    },
    description:
      settings.storeDescription || 'Découvre notre sélection de produits, livrés où que tu sois.',
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0c0e' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: 'rounded-xl border border-border shadow-premium-lg font-sans',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
