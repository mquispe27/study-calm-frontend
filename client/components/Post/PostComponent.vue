<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import CommentListComponent from "../Comment/CommentListComponent.vue";

const props = defineProps(["post", "comment"]);
const emit = defineEmits(["editPost", "refreshPosts", "createComment", "refreshComments"]);
const { currentUsername } = storeToRefs(useUserStore());

const deletePost = async () => {
  if (confirm("Are you sure you want to delete this post?")) {
    try {
      await fetchy(`/api/posts/${props.post._id}`, "DELETE");
    } catch {
      return;
    }
    emit("refreshPosts");
  }
};
</script>

<template>
  <p class="author">{{ props.post.author }}</p>
  <p>{{ props.post.content }}</p>
  <div class="base">
    <menu>
      <li v-if="props.post.author == currentUsername"><button class="btn-small" @click="emit('editPost', props.post._id)">Edit</button></li>
      <li v-if="props.post.author == currentUsername"><button class="button-error btn-small" @click="deletePost">Delete</button></li>
    </menu>
    <article class="timestamp">
      <p v-if="props.post.dateCreated !== props.post.dateUpdated">Edited on: {{ formatDate(props.post.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.post.dateCreated) }}</p>
    </article>
  </div>
  <CommentListComponent :parent="props.post._id.toString()" :post="props.post" :showBox="false" @refreshComments="$emit('refreshComments')" />
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
