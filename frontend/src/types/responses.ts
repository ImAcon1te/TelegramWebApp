
export interface UserData{
  "user_id": number,
  "first_name": string,
  "last_name": string,
  "phone": string,
  "region_id": string,
}

export type Regions = Array<{
  district: string,
  id:number
  oblast: string
}>
export interface OfferTypesData {
  "commodity_types": Array<{ "id": number, "code": string, "name": string }>,
  "vehicle_types": Array<{ "id": number, "code": string, "name": string }>
}
export interface Offer{
  "additional_info": string,
  "commodity_type_id": number,
  "created_at": string,
  "id": number,
  "price": number,
  "region_id": number,
  "tonnage": number,
  "days": number,
  "updated_at": string,
  "user_first_name": string,
  "user_id": number,
  "user_image": string,
  "user_last_name": string
}