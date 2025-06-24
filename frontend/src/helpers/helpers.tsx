import {Offer} from "../types/responses.ts";
import {RolesMap} from "../types/common.ts";

export const getOfferType = (offer?: Offer | Partial<Offer>) => {
  if(!offer){
    return RolesMap.CULTURE
  }
  return offer.commodity_type ? RolesMap.CULTURE : RolesMap.VEHICLE
}