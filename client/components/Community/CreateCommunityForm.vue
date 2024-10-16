<script setup lang="ts">
import { useCommunityStore } from "@/stores/community";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const communityStore = useCommunityStore();

const name = ref("");
const description = ref("");
// const props = defineProps<{ inCommunity: boolean; communityName?: string }>();
const createdScreen = ref(false);

const createPost = async (name: string, description: string) => {
  try {
    const createdCommunity = await fetchy("/api/groups", "POST", {
      body: { name: name, description: description },
    });

    createdScreen.value = true;
    communityStore.setCommunityCreated(true);
    emptyForm();
  } catch (_) {
    return;
  }
};

function flipCreatedScreen() {
  createdScreen.value = !createdScreen.value;
}

const emptyForm = () => {
  name.value = "";
  description.value = "";
};
</script>

<template>
  <form v-if="!createdScreen" @submit.prevent="createPost(name, description)">
    <label for="content">Create a new community!</label>
    <input type="text" id="name" v-model="name" placeholder="Name" required />
    <textarea id="description" v-model="description" placeholder="A snazzy description" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create</button>
  </form>
  <div v-else>
    <h2>Community created!</h2>
    <h2>Open it to the left</h2>
    <button @click="flipCreatedScreen">Create another community</button>
  </div>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
