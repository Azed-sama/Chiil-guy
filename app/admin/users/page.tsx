import type { Metadata } from 'next'
import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAllUsers } from '@/lib/data/admin/users'
import { UserRoleSelect } from '@/components/admin/user-role-select'
import { UserBlockToggle } from '@/components/admin/user-block-toggle'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Utilisateurs — Administration' }

function formatJoinDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminUsersPage() {
  const supabase = createClient()
  const [
    {
      data: { user: currentUser },
    },
    users,
  ] = await Promise.all([supabase.auth.getUser(), getAllUsers()])

  return (
    <main className="container py-8">
      <h1 className="font-display text-2xl">Utilisateurs</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {users.length} compte{users.length > 1 ? 's' : ''}
      </p>

      {users.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
          <Users className="h-8 w-8 text-ink-muted" aria-hidden="true" />
          <p className="text-sm text-ink-muted">Aucun utilisateur pour le moment.</p>
        </div>
      ) : (
        <>
          {/* Vue tableau — écrans sm et plus */}
          <div className="mt-6 hidden overflow-x-auto rounded-lg border border-border sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-muted text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Client
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Commandes
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Inscrit le
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Rôle
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Compte actif
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const isSelf = user.id === currentUser?.id
                  return (
                    <tr key={user.id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">
                          {user.fullName || 'Sans nom'}{' '}
                          {isSelf && <span className="text-xs text-accent">(toi)</span>}
                        </div>
                        <div className="text-xs text-ink-muted">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{user.orderCount}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                        {formatJoinDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <UserRoleSelect userId={user.id} role={user.role} disabled={isSelf} />
                      </td>
                      <td className="px-4 py-3">
                        <UserBlockToggle userId={user.id} isBlocked={user.isBlocked} disabled={isSelf} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Vue cartes — mobile */}
          <div className="mt-6 space-y-4 sm:hidden">
            {users.map((user) => {
              const isSelf = user.id === currentUser?.id
              return (
                <div key={user.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">
                        {user.fullName || 'Sans nom'}{' '}
                        {isSelf && <span className="text-xs text-accent">(toi)</span>}
                      </p>
                      <p className="text-xs text-ink-muted">{user.email}</p>
                    </div>
                    {user.isBlocked && <Badge variant="danger">Bloqué</Badge>}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-ink-muted">
                      {user.orderCount} commande{user.orderCount > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-ink-muted">{formatJoinDate(user.createdAt)}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                    <div>
                      <p className="mb-1 text-xs text-ink-muted">Rôle</p>
                      <UserRoleSelect userId={user.id} role={user.role} disabled={isSelf} />
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-xs text-ink-muted">Compte actif</p>
                      <UserBlockToggle userId={user.id} isBlocked={user.isBlocked} disabled={isSelf} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
