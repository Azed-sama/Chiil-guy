import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request)
  const { pathname } = request.nextUrl
  
  // Note : la session anonyme (Guest Checkout) est déjà créée dans
  // updateSession() ci-dessus si besoin — ne pas la recréer ici, ça
  // écraserait le cookie de session sur un `response` jetable et
  // casserait la persistance de session (bug corrigé le 20/07).
  
  // ---------------------------------------------------------
  // Espace client : authentification REELLE requise (un compte
  // anonyme ne suffit pas à accéder à l'espace "Mon compte")
  // ---------------------------------------------------------
  if (pathname.startsWith('/account') && (!user || user.is_anonymous)) {
    const url = request.nextUrl.clone()
    url.pathname = '/connexion'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  // ---------------------------------------------------------
  // Espace admin : authentification + rôle admin + compte non bloqué
  // Vérification faite ici côté serveur (impossible à contourner
  // en manipulant le JS du navigateur), en complément du RLS qui
  // protège les données elles-mêmes en dernier recours.
  // ---------------------------------------------------------
  if (pathname.startsWith('/admin')) {
    if (!user || user.is_anonymous) {
      const url = request.nextUrl.clone()
      url.pathname = '/connexion'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_blocked')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin' || profile.is_blocked) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Exécute le middleware sur toutes les routes SAUF :
     * - fichiers statiques Next.js (_next/static, _next/image)
     * - favicon et images publiques
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}