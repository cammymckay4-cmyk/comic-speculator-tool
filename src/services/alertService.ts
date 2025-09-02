import { supabase } from '@/lib/supabaseClient'
import type { UserAlert, AlertType } from '@/lib/types'

// Interface for the alerts table in Supabase
export interface SupabaseAlert {
  id: string
  userId: string
  comicId?: string
  name: string
  alertType: AlertType
  thresholdPrice?: number
  priceDirection?: 'above' | 'below'
  isActive: boolean
  createdAt: string
  lastTriggered?: string
  triggerCount: number
  description?: string
}

// Transform Supabase data to match our frontend types
const transformSupabaseAlert = (supabaseAlert: SupabaseAlert): UserAlert => {
  const userAlert: UserAlert = {
    id: supabaseAlert.id,
    userId: supabaseAlert.userId,
    comicId: supabaseAlert.comicId,
    type: supabaseAlert.alertType,
    criteria: {
      priceThreshold: supabaseAlert.thresholdPrice,
      priceDirection: supabaseAlert.priceDirection,
    },
    isActive: supabaseAlert.isActive,
    createdDate: supabaseAlert.createdAt,
    lastTriggered: supabaseAlert.lastTriggered,
    triggerCount: supabaseAlert.triggerCount,
    name: supabaseAlert.name,
    description: supabaseAlert.description,
  }

  return userAlert
}

export const fetchAlerts = async (userId: string): Promise<UserAlert[]> => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch alerts: ${error.message}`)
  }

  if (!data) {
    return []
  }

  return data.map(transformSupabaseAlert)
}

export interface CreateAlertData {
  userId: string
  comicId?: string
  name: string
  alertType: AlertType
  thresholdPrice?: number
  priceDirection?: 'above' | 'below'
  description?: string
}

export const createAlert = async (alertData: CreateAlertData): Promise<UserAlert> => {
  const supabaseAlertData = {
    userId: alertData.userId,
    comicId: alertData.comicId,
    name: alertData.name,
    alertType: alertData.alertType,
    thresholdPrice: alertData.thresholdPrice,
    priceDirection: alertData.priceDirection,
    description: alertData.description,
    isActive: true,
    triggerCount: 0,
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert(supabaseAlertData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create alert: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from alert creation')
  }

  return transformSupabaseAlert(data)
}

export const updateAlertStatus = async (alertId: string, isActive: boolean): Promise<UserAlert> => {
  const { data, error } = await supabase
    .from('alerts')
    .update({ isActive: isActive })
    .eq('id', alertId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update alert status: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from alert update')
  }

  return transformSupabaseAlert(data)
}

export const deleteAlert = async (alertId: string): Promise<void> => {
  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', alertId)

  if (error) {
    throw new Error(`Failed to delete alert: ${error.message}`)
  }
}