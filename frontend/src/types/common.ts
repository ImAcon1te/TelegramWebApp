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

export interface UserFormData {
  firstName: string;
  lastName: string;
  phone: string;
  region: number | string;
  isSale: boolean;
  isPurchase: boolean;
  isRental: boolean;
}
export interface OfferType {
  id: number,
  code: string,
  name: string
}

export enum RolesMap {
  CULTURE = 'Culture',
  VEHICLE = 'Vehicle'
}
// export enum OffersTypeMap {
//   CULTURE = 'culture',
//   VEHICLE = 'vehicle'
// }

