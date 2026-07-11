import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { updateUserProfile } from '@/lib/firestore'
import { useAuthStore }      from '@/store/authStore'
import { Input }  from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
})
type FormData = z.infer<typeof schema>

export function ProfilePage() {
  const user          = useAuthStore(s => s.user)
  const profile       = useAuthStore(s => s.profile)
  const refreshProfile = useAuthStore(s => s.refreshProfile)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { displayName: profile?.displayName ?? '' },
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setSaving(true)
    try {
      await updateProfile(user, { displayName: data.displayName })
      await updateUserProfile(user.uid, { displayName: data.displayName })
      await refreshProfile()
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-semibold text-charcoal-900">Profile Settings</h2>

      <div className="card p-6">
        <h3 className="font-medium text-charcoal-900 mb-4">Personal Information</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <Input
            label="Display Name"
            {...register('displayName')}
            error={errors.displayName?.message}
          />
          <Input
            label="Email Address"
            type="email"
            value={user?.email ?? ''}
            disabled
            hint="Email cannot be changed here. Contact support."
          />
          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="font-medium text-charcoal-900 mb-2">Account Details</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><span className="font-medium text-charcoal-800">Account type:</span> {profile?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
          <p><span className="font-medium text-charcoal-800">Member since:</span> {profile?.createdAt ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(profile.createdAt.toDate()) : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}
