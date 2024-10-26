<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
import RegisterForm from "@/components/Login/RegisterForm.vue";
</script>

<template>
  <main class="column">
    <h1>Please login or register!</h1>
    <LoginForm />
    <RegisterForm />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
.column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
