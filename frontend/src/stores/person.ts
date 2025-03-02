import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type Person from '@/types/person'
import type Event from '@/types/event'

export const usePersonStore = defineStore('person', {
  state: () => (<Person>{
    name: '',
    surname: '',
    birth: '',
    email: '',
    phone: '',
    event_id: '',
    verifiedCategories: [] as Event["price_categories"],
    member_id: 0,
    pi_secret: '',
  }),
  getters: {
    fullName: (state) => `${state.name} ${state.surname}`,
    bestPriceCategory: (state) => {
      if (state.verifiedCategories.length !== 0) {
        state.verifiedCategories.sort((a, b) => a.price! - b.price!);
        return state.verifiedCategories[0];
      }
    },
  },
  actions: {},
  persist: true,
})
