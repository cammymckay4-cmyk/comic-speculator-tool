import { supabase } from '@/lib/supabaseClient'
import type { UserAlert, AlertType } from '@/lib/types'

// Interface for the alerts table in Supabase
export interface SupabaseAlert {
  id: string
  user_id: string
  comic_id?: string
  name: string
  alert_type: AlertType
  threshold_price?: number
  price_direction?: 'above' | 'below'
  is_active: boolean
  created_at: string
  last_triggered?: string
  trigger_count: number
  description?: string
}

// Transform Supabase data to match our frontend types
const transformSupabaseAlert = (supabaseAlert: SupabaseAlert): UserAlert => {
  const userAlert: UserAlert = {
    id: supabaseAlert.id,
    userId: supabaseAlert.user_id,
    comicId: supabaseAlert.comic_id,
    type: supabaseAlert.alert_type,
    criteria: {
      priceThreshold: supabaseAlert.threshold_price,
      priceDirection: supabaseAlert.price_direction,
    },
    isActive: supabaseAlert.is_active,
    createdDate: supabaseAlert.created_at,
    lastTriggered: supabaseAlert.last_triggered,
    triggerCount: supabaseAlert.trigger_count,
    name: supabaseAlert.name,
    description: supabaseAlert.description,
  }

  return userAlert
}

export const fetchAlerts = async (): Promise<UserAlert[]> => {
  // Get the current user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch alerts: ${error.message}`)
  }

  if (!data) {
    return []
  }

  return data.map(transformSupabaseAlert)
}

export interface CreateAlertData {
  comicId?: string
  name: string
  alertType: AlertType
  thresholdPrice?: number
  priceDirection?: 'above' | 'below'
  description?: string
}

export const createAlert = async (alertData: CreateAlertData): Promise<UserAlert> => {
  // Get the current user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  // Validate required fields
  if (!alertData.name?.trim()) {
    throw new Error('Alert name is required')
  }

  // Validate price-related fields for price alerts
  if (['price-drop', 'price-increase'].includes(alertData.alertType)) {
    if (!alertData.thresholdPrice || alertData.thresholdPrice <= 0) {
      throw new Error('Valid threshold price is required for price alerts')
    }
    if (!alertData.priceDirection || !['above', 'below'].includes(alertData.priceDirection)) {
      throw new Error('Price direction (above/below) is required for price alerts')
    }
  }

  console.log('Creating alert with data:', {
    userId: user.id,
    comicId: alertData.comicId,
    name: alertData.name,
    alertType: alertData.alertType,
    thresholdPrice: alertData.thresholdPrice,
    priceDirection: alertData.priceDirection
  })

  const supabaseAlertData = {
    user_id: user.id,
    comic_id: alertData.comicId || null,
    name: alertData.name.trim() || 'Unnamed Alert',
    alert_type: alertData.alertType,
    threshold_price: alertData.thresholdPrice || null,
    price_direction: alertData.priceDirection || null,
    description: alertData.description?.trim() || `Alert for ${alertData.alertType} notifications`,
    is_active: true,
    trigger_count: 0,
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert(supabaseAlertData)
    .select()
    .single()

  if (error) {
    console.error('Supabase error creating alert:', error)
    
    // Provide more specific error messages based on error code
    if (error.code === 'PGRST116') {
      throw new Error('No data returned - the alerts table may not exist. Please contact support.')
    } else if (error.code === '42P01') {
      throw new Error('The alerts table does not exist in the database. Please contact support.')
    } else if (error.code === '23514') {
      throw new Error('Invalid alert type or price direction provided')
    } else if (error.message.includes('row-level security')) {
      throw new Error('You do not have permission to create alerts. Please ensure you are logged in.')
    } else {
      throw new Error(`Failed to create alert: ${error.message}`)
    }
  }

  if (!data) {
    throw new Error('No data returned from alert creation')
  }

  console.log('Alert created successfully:', data)
  return transformSupabaseAlert(data)
}

export const updateAlertStatus = async (alertId: string, isActive: boolean): Promise<UserAlert> => {
  const { data, error } = await supabase
    .from('alerts')
    .update({ is_active: isActive })
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