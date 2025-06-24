import {RolesMap, SelectOption} from "./types/common.ts";
export const BASE_URL = 'http://localhost:80/'

export const OfferOptions:SelectOption[] = [
  {
    label: "Культура",
    value: RolesMap.CULTURE
  },
  {
    label: "Техника",
    value: RolesMap.VEHICLE
  },
]