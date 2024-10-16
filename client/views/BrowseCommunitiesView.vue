<script setup lang="ts">
import BrowseCommunitiesComponent from "@/components/Community/BrowseCommunitiesComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const route = useRoute();
</script>

<template>
  <main>
    <div>
      <BrowseCommunitiesComponent />
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
