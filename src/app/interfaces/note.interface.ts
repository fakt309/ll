export interface Note {
  id: number
  createTimestamp?: number
  value: string
  status: 'active' | 'done' | 'canceled'
  priority: number
}
