export type TgUserId = number

export interface SelectOption {
  label: string,
  value: string | number
}
export interface Region {
  id: number;
  oblast: string;
  district?: string;
}


export interface OfferType {
  id: number,
  code: string,
  name: string
}

export enum RolesMap {
  CULTURE = 'culture',
  VEHICLE = 'vehicle'
}
// export enum OffersTypeMap {
//   CULTURE = 'culture',
//   VEHICLE = 'vehicle'
// }

