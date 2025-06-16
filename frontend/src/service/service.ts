import {UserFormData} from "../types/common.ts";
import {CreateOfferData} from "../types/forms.ts";

export const postRegistration = (formData: UserFormData) => {
  const body = new URLSearchParams({
    phone: formData.phone,
    first_name: formData.firstName,
    last_name:  formData.lastName,
    region:     String(formData.region),
    is_sale:     formData.isSale     ? '1' : '0',
    is_purchase: formData.isPurchase ? '1' : '0',
    is_rental:   formData.isRental   ? '1' : '0',
  });

  return fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: body.toString(),
    credentials: 'same-origin'
  });
}
export const postCreate = (formData: CreateOfferData) => {
  return fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: JSON.stringify(formData),
    credentials: 'same-origin'
  });
}