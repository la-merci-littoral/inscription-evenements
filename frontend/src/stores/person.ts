import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface PersonState {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  city: string;
  country: string;
}

export const usePersonStore = defineStore<'person', PersonState>('person', {
  state: () => ({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    zip: '',
    city: '',
    country: '',
  }),
  getters: {
    fullName() {
      return `${this.name} ${this.surname}`
    }
  },
  actions: {
  },
  persist: true,
})
