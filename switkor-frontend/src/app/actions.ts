'use server';

import { api } from '../../lib/api';

export async function pingBackend() {
  const { data } = await api.get('/');   // tu backend devuelve “Hello World” o similar
  return data;
}
