
export interface UserData{
  "user_id": number,
  "first_name": string,
  "last_name": string,
  "phone": string,
  "region_id": string,
}
export interface Region {
  district: string,
  id:number
  oblast: string
}
export type CommodityType = {
  id: number;
  code: string;
  name: string;
};
export interface OfferTypesData {
  "commodity_types": CommodityType[],
  "vehicle_types": CommodityType[]
}
export type Offer = {
  id: number;
  price: number;
  tonnage: number;
  days: number;
  additional_info: string;
  created_at: string;
  updated_at: string;
  commodity_type: CommodityType;
  region: Region;
  user: UserData;
  user_first_name: string;
  user_last_name: string;
  user_image: string;
};
