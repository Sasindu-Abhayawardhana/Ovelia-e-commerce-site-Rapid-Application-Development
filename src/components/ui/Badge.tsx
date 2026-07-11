import React from 'react'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'terracotta' | 'green' | 'yellow' | 'blue' | 'red' | 'gray'
  className?: string
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const map = {
    terracotta: 'badge-terracotta',
    green:      'badge-green',
    yellow:     'badge-yellow',
    blue:       'badge-blue',
    red:        'badge-red',
    gray:       'badge-gray',
  }
  return <span className={cn(map[variant], className)}>{children}</span>
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; variant: BadgeProps['variant'] }> = {
    Placed:     { label: 'Order Placed',  variant: 'blue' },
    Processing: { label: 'Processing',    variant: 'yellow' },
    Shipped:    { label: 'Shipped',       variant: 'terracotta' },
    Delivered:  { label: 'Delivered',     variant: 'green' },
    Cancelled:  { label: 'Cancelled',     variant: 'red' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}
