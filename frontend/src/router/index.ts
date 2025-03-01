import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'

const router = createRouter({
  // history: createWebHistory(process.env.SITE_HOST),
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/choix',
      name: 'choice',
      component: () => import('../views/ChoiceView.vue')
    },
    {
      path: '/statut',
      name: 'status',
      component: () => import('../views/StatusView.vue')
    },
    {
      path: '/mes-informations',
      name: 'info',
      component: () => import('../views/InfoView.vue'),
    },
    {
      path: '/paiement',
      name: 'payment',
      component: () => import('../views/PaymentView.vue'),
    },
    {
      path: '/validation',
      name: 'validation',
      component: () => import('../views/ValidationView.vue'),
    },
    {
      path: '/confirmation',
      name: 'confirmation',
      component: () => import('../views/ConfirmationView.vue'),
    },
  ],
})

export default router
