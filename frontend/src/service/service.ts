import {CreateOfferData, UserFormData} from "../types/forms.ts";
// import {BASE_URL} from "../constants.ts";
export const getTgId = () => {
  return 556717307
}
export const getHeaders = () => {
  return {
    headers: {
      'Content-Type': 'application/json'
    },
  }
}
const getBody = (body: object) => {
  return {
    ...body,
    telegram_user_id: getTgId()
  }
}
export const postRegistration = async (formData: UserFormData) => {
  const body = getBody(formData)

  return await fetch(`/register`, {
    method: 'POST',

    body: JSON.stringify(body),
    credentials: 'same-origin'
  }).then(resp=>resp.json());
}

export const getUser = async () => {
  fetch(
    `/user?=${getTgId()}`
  )
  .then(res => {
    if (!res.ok) throw new Error('Ошибка сети');
    return res.json();
  })
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

