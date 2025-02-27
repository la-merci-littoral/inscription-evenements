import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type Person from '@/types/person'

export const usePersonStore = defineStore('person', {
  state: () => (<Person>{
    name: '',
    surname: '',
    email: '',
    phone: '',
    pi_secret: '',
  }),
  getters: {
    fullName: (state) => `${state.name} ${state.surname}`
  },
  actions: {
  },
  persist: true,
})
