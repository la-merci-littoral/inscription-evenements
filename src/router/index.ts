import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import { env } from 'process'

const router = createRouter({
  history: createWebHistory(process.env.SITE_HOST),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/mes-informations',
      name: 'info',
      component: () => import('../views/InfoView.vue'),
    },
    {
      path: '/confirmation',
      name: 'confirm',
      component: () => import('../views/ConfirmView.vue'),
    },
    {
      path: '/paiement',
      name: 'payment',
      component: () => import('../views/PaymentView.vue'),
    },
    {
      path: '/terminé',
      name: 'final',
      component: () => import('../views/FinalView.vue'),
    },
  ],
})

export default router
