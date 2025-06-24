import {RolesMap} from "./common.ts";

export interface OfferData{
  id?: number,
  offer_type: RolesMap,
  region_id: number | undefined,
  price: number
  additional_info: string
  type_id: number | undefined,
  tonnage: number,
  days: number
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  phone: string;
  region_id: number | string | undefined;
}

export interface RequestOfferData{
  "offer_type": RolesMap,
  "offer_id": number,
  "overwrite_sum": number,
  "overwrite_amount": number,
  "comment": string
}
export type RequestOfferDataBase = Omit<RequestOfferData, 'overwrite_sum' | 'overwrite_amount'> &
  Partial<Pick<RequestOfferData, 'overwrite_sum' | 'overwrite_amount'>>