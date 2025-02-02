import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface UserState {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  remoteID: string;
}

export const useUserStore = defineStore<'user', UserState>('user', {
  state: () => ({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    zip: '',
    city: '',
    country: '',
    remoteID: ''
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
