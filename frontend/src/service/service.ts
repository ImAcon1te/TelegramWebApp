import {OfferData, UserFormData} from "../types/forms.ts";
import {RolesMap} from "../types/common.ts";
// import {BASE_URL} from "../constants.ts";
export const getTgId = () => {
  // return 556717307
  return 551234
}
export const getInitForGet = () => {
  return {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    },
  }
}
const getBody = (body: object) => {
  return JSON.stringify({
    ...body,
    telegram_user_id: getTgId()
  })
}
export const postRegistration = async (formData: UserFormData) => {
  const body = getBody(formData)

  return await fetch(`/register`, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': ' application/json'
    },
    credentials: 'same-origin'
  }).then(resp=>resp.json());
}

export const postUpdateUser = async (formData: UserFormData) => {
  const body = getBody(formData)

  return await fetch(`/user/update`, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': ' application/json'
    },
    credentials: 'same-origin'
  }).then(resp=>resp.json());
}

export const postCreateOffer = async (formData: OfferData) => {
  const body = getBody(formData)
  console.log('body', body)
  return await fetch('/offer/create', {
    method: 'POST',
    headers: {
      'Content-Type': ' application/json'
    },
    body: body,
    credentials: 'same-origin'
  }).then(resp=>resp.json());;
}

export const postUpdateOffer = async (formData: OfferData) => {
  const body = getBody(formData)
  return await fetch('/offer/update', {
    method: 'PATCH',
    headers: {
      'Content-Type': ' application/json'
    },
    body: body,
    credentials: 'same-origin'
  }).then(resp=>resp.json());;
}


export const postDeleteOffer = async (formData: {
  "offer_type": RolesMap,
  "id": number
}) => {
  const body = getBody(formData)
  return await fetch('/offer/delete', {
    method: 'POST',
    headers: {
      'Content-Type': ' application/json'
    },
    body: body,
    credentials: 'same-origin'
  }).then(resp=>resp.json());;
}
