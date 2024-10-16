<script setup lang="ts">
import CreateCommunityForm from "@/components/Community/CreateCommunityForm.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <div>
      <CreateCommunityForm />
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
