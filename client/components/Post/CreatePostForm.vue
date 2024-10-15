<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshPosts"]);
const props = defineProps<{ inCommunity: boolean; communityName?: string }>();

const createPost = async (content: string) => {
  try {
    const createdPost = await fetchy("/api/posts", "POST", {
      body: { content },
    });
    if (props.inCommunity) {
      const group = await fetchy(`/api/groups/${props.communityName}`, "GET");
      const groupId = group._id;
      // add content to community
      await fetchy(`/api/groups/${groupId}`, "PATCH", {
        body: { contentId: createdPost.post._id },
      });
    }
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createPost(content)">
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
  </form>
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
