import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type Person from '@/types/person'

export const usePersonStore = defineStore('person', {
  state: () => (<Person>{
    name: '',
    surname: '',
    birth: '',
    email: '',
    phone: '',
    event_id: '',
    price_category: '',
    price: 0,
    member_id: 0,
    pi_secret: '',
  }),
  getters: {
    fullName: (state) => `${state.name} ${state.surname}`
  },
  actions: {
  },
  persist: true,
})
