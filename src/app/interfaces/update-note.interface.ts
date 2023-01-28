export interface UpdateNote {
  id: number
  timestamp: number
  action: 'create' | 'delete' | 'changeValue' | 'changeStatus'
  oldValue: string
  newValue: string
  oldStatus: boolean
  newStatus: boolean
}
