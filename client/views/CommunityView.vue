<script setup lang="ts">
import CommunityPostListComponent from "@/components/Community/CommunityPostListComponent.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
const name = Array.isArray(route.query.name) ? (route.query.name[0] ?? "") : (route.query.name ?? "");
</script>

<template>
  <main>
    <h1>{{ name }}</h1>
    <CommunityPostListComponent :community="id" :name="name" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
