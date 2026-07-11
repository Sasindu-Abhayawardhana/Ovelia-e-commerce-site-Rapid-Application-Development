import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllUsers } from '@/lib/firestore'
import { functions } from '@/lib/firebase'
import { httpsCallable } from 'firebase/functions'
import { Skeleton }   from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import type { UserProfile } from '@/types'
import toast from 'react-hot-toast'

export function AdminCustomersPage() {
  const [users,   setUsers]   = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = () => {
    getAllUsers().then(setUsers).finally(() => setLoading(false))
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const setUserRole = httpsCallable(functions, 'setUserRole')
      await setUserRole({ targetUid: userId, role: newRole })
      toast.success(`Role updated successfully.`)
      fetchUsers()
    } catch (e: any) {
      toast.error(e.message || 'Failed to update role.')
    }
  }

  const filtered = users.filter(u =>
    !search ||
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Customers</h1>
        <p className="text-gray-500">{users.length} registered customers</p>
      </div>

      <div className="mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input-base max-w-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.uid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-cream-100 hover:bg-cream-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-600 font-semibold text-xs shrink-0">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-charcoal-900">{user.displayName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role || 'customer'}
                      onChange={e => handleRoleChange(user.uid, e.target.value)}
                      className={`text-xs border border-cream-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-terracotta-300 ${user.role === 'admin' ? 'bg-terracotta-50 text-terracotta-700' : 'bg-gray-50 text-gray-700'}`}
                    >
                      <option value="customer">customer</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.createdAt ? formatDate(user.createdAt) : '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-10 text-gray-400">No customers found.</div>}
        </div>
      )}
    </div>
  )
}
