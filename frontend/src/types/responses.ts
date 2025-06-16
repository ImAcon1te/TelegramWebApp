
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