import {Offer, RequestOffer} from "../types/responses.ts";
import {RolesMap} from "../types/common.ts";

export const getOfferType = (offer?: Offer | Partial<Offer> | RequestOffer | Partial<RequestOffer>) => {
  if(!offer){
    return RolesMap.CULTURE
  }
  if('commodity_type' in offer){
    return RolesMap.CULTURE
  }
  else if('vehicle_type' in offer){
    return RolesMap.VEHICLE
  }else if('offer_type' in offer){
    console.log('test', offer.offer_type)
    return offer.offer_type === 'culture' ? RolesMap.CULTURE : RolesMap.VEHICLE
  }
  return RolesMap.CULTURE
}


export const objectToQueryString = (
  obj?: Record<string, any> | null
) => {
  if(!obj){
    return null
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, String(item)));
      } else {
        params.append(key, String(value));
      }
    }
  }
  return params
}
export function objectToQueryStringWithURL(
  baseUrl: string,
  obj?: Record<string, any> | null
): string {

  if(!obj){
    return baseUrl
  }

  const params = objectToQueryString(obj)

  const queryString = params?.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}