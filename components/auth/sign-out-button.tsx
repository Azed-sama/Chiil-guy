import { signOut } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="sm" className={className}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Se déconnecter
      </Button>
    </form>
  )
}
