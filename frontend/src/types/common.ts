export type TgUserId = number

export interface SelectOption {
  label: string,
  value: string | number
}

export enum RolesMap {
  CULTURE = 'culture',
  VEHICLE = 'vehicle'
}
export type StatusType = "pending" | "active" | string;

export interface TgUser {
  allows_write_to_pm: boolean
  first_name: string
  id: number
  language_code: string
  last_name: string
  photo_url: string
  username: string
}