import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request)
  const { pathname } = request.nextUrl
  
  // ---------------------------------------------------------
  // Guest Checkout : tout visiteur sans session (même pas anonyme)
  // reçoit automatiquement une session anonyme Supabase. Ça lui
  // donne un user_id valide dès la première visite, ce qui permet
  // au panier et à la commande de fonctionner sans email/mot de
  // passe. S'il crée un compte plus tard, Supabase peut fusionner
  // ce compte anonyme avec le compte réel (upgrade), sans perdre
  // son panier.
  // ---------------------------------------------------------
  if (!user) {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('Anonymous sign-in failed:', error.message)
    }
  }
  
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