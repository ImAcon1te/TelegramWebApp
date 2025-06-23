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