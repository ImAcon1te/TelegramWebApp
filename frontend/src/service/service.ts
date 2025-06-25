import {OfferData, RequestOfferDataBase, UserFormData} from "../types/forms.ts";
import {RolesMap, TgUser} from "../types/common.ts";

export const getTg = ()  => {
  const hash = sessionStorage.getItem('tgWebAppHash');
  console.log('hash', hash)
  if(!hash) return null
  const queryString = hash.replace(/^#\/?/, '');
  const tgParams = new URLSearchParams(queryString);
  const rawWebAppData = tgParams.get('tgWebAppData');
  if (!rawWebAppData) return;
  const innerParams = new URLSearchParams(rawWebAppData);
  const userStr = innerParams.get('user');
  try {
    if (userStr) {
      const decodedUser = decodeURIComponent(userStr);
      const parsedUser = JSON.parse(decodedUser);
      return parsedUser as TgUser
    }
  } catch (err) {
    console.warn('Ошибка парсинга tgWebAppData:', err);
  }

}
export const getTgId = () => {
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if(isLocalhost){
    return  551234
  }
  return getTg()?.id
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

export const postRequestOffer = async (formData: RequestOfferDataBase) => {
  const body = getBody(formData)
  return await fetch('/offer/request', {
    method: 'POST',
    headers: {
      'Content-Type': ' application/json'
    },
    body: body,
    credentials: 'same-origin'
  }).then(resp=>resp.json());;
}

export const postRequestOfferDelete = async (formData: {
  "offer_type": RolesMap,
  "id": number
}) => {
  const body = getBody(formData)
  return await fetch('/offer/request', {
    method: 'POST',
    headers: {
      'Content-Type': ' application/json'
    },
    body: body,
    credentials: 'same-origin'
  }).then(resp=>resp.json());;
}