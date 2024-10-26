<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshPosts"]);
const props = defineProps<{ inCommunity: boolean; communityName?: string }>();

const imageUrl = ref("");

async function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  console.log("testing");
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);
  console.log(formData.get("image"));

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    imageUrl.value = data.imageUrl;
  } catch (error) {
    console.error("Failed to upload image:", error);
  }
}

const createPost = async (content: string) => {
  try {
    const createdPost = await fetchy("/api/posts", "POST", {
      body: { content, imageUrl: imageUrl.value },
    });
    if (props.inCommunity) {
      const group = await fetchy(`/api/groups/name/${props.communityName}`, "GET");
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
    <label for="image">Image</label>
    <input type="file" id="image" @change="handleImageUpload" />
    <button type="submit" class="pure-button-primary">Create Post</button>
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
