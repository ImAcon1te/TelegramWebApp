import {Offer} from "../types/responses.ts";
import {RolesMap} from "../types/common.ts";

export const getOfferType = (offer?: Offer | Partial<Offer>) => {
  if(!offer){
    return RolesMap.CULTURE
  }
  return offer.commodity_type ? RolesMap.CULTURE : RolesMap.VEHICLE
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