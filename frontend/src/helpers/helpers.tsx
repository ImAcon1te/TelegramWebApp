import {Offer} from "../types/responses.ts";
import {RolesMap} from "../types/common.ts";

export const getOfferType = (offer: Offer) => {
  return offer.commodity_type_id ? RolesMap.CULTURE : RolesMap.VEHICLE
}