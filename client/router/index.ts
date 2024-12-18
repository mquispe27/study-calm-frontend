import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import BrowseCommunitiesView from "../views/BrowseCommunitiesView.vue";
import CommunityView from "../views/CommunityView.vue";
import CreateCommunityView from "../views/CreateCommunityView.vue";
import EventsView from "../views/EventsView.vue";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import SettingView from "../views/SettingView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/setting",
      name: "Settings",
      component: SettingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/match",
      name: "PartnerMatch",
      component: () => import("../views/MatchingView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/community/:id",
      name: "CommunityView",
      component: CommunityView,
      meta: { requiresAuth: true },
      props: (route) => ({ id: route.params.id, name: route.query.name }),
    },
    {
      path: "/community/create",
      name: "CreateCommunity",
      component: CreateCommunityView,
      meta: { requiresAuth: true },
    },
    {
      path: "/community/browse",
      name: "BrowseCommunities",
      component: BrowseCommunitiesView,
      meta: { requiresAuth: true },
    },
    {
      path: "/community/:id/events",
      name: "Events",
      component: EventsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
