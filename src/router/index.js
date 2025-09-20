import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserLogin from '@/views/UserLogin.vue'
import ProductPage from '@/views/ProductPage.vue'
import UserRegister from '@/views/UserRegister.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import ResetPasswordSent from '@/views/ResetPasswordSent.vue'
import Cart from '@/views/Cart.vue'
import CartItem from '@/views/CartItem.vue'
import PaymentPage from '@/views/PaymentPage.vue'
import LocationPage from '@/views/LocationPage.vue'
import OrderPage from '@/views/OrderPage.vue'
import OrderDetail from '@/views/OrderDetail.vue'
import CouponPage from '@/views/CouponPage.vue'
import AdminOrderDetail from '@/views/AdminOrderDetail.vue'
import AdminProduct from '@/views/AdminProduct.vue'
import ProductDetailPage from '@/views/ProductDetailPage.vue'
import UserProfile from '@/views/UserProfile.vue'
import ResetPassword from '@/views/ResetPassword.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView,
    // },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
    {
      path: '/',
      name: 'login',
      component: UserLogin,
    },
    {
      path: '/register',
      name: 'register',
      component: UserRegister,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword,
    },
    {
      path: '/reset-password-sent',
      name: 'ResetPasswordSent',
      component: ResetPasswordSent,
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: ResetPassword,
    },
    {
      path: '/userprofile',
      name: 'user-profile',
      component: UserProfile,
      meta: {
        requiresAuth: true // This route requires authentication
      }
    },
    {
      path: '/product',
      name: 'product',
      component: ProductPage,
    },
    {
      path: '/product/:id',
      name: 'ProductDetail',
      component: ProductDetailPage,
      props: true // This allows the route params to be passed as props
    },
    {
      path: '/cart',
      name: 'cart',
      component: Cart,
    },
    {
      path: '/cartitem',
      name: 'cartitem',
      component: CartItem,
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentPage,
    },
    {
      path: '/location',
      name: 'location',
      component: LocationPage,
    },
    {
      path: '/order',
      name: 'order',
      component: OrderPage,
    },
    {
      path: '/order/:orderId', // Dynamic route for order detail page
      name: 'OrderDetail',
      component: OrderDetail,
      props: true, // Pass route params as props to the component
    },
    {
      path: '/coupon',
      name: 'coupon',
      component: CouponPage,
      props: true, // Pass route params as props to the component
    },
    {
      path: '/admin/orderdetail',
      name: 'adminorderdetail',
      component: AdminOrderDetail,
    },
    {
      path: '/admin/product',
      name: 'adminproduct',
      component: AdminProduct,
    }
  ],
})

export default router
