import {RolesMap} from "./common.ts";

export interface CreateOfferData{
  offer_type: RolesMap,
  region_id: number,
  price: number
  additional_info: string
  type_id: number | undefined,
  tonnage: number,
  days: number
}