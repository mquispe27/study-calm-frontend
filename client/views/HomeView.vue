<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main class="content">
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Welcome to StudyCalm, the mindful, goal-driven social media app. Please login!</h1>
    </section>
    <h1>Find a community to your left, or a match to your top right!</h1>
    <div class="image-container">
      <img src="@/assets/images/wave-after-wave.png" alt="Community" />
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* padding: 1em; */
}

.image-container {
  position: relative;
  width: 100%;
  margin-top: auto;
}

.image-container img {
  width: 100%;
  height: auto;
  display: block;
}
</style>
