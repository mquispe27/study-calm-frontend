<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import CommentListComponent from "./CommentListComponent.vue";

const props = defineProps(["comment"]);
const emit = defineEmits(["editComment", "refreshComments", "deleteComment", "createComment"]);
const { currentUsername } = storeToRefs(useUserStore());

const deleteComment = async () => {
  try {
    await fetchy(`/api/comments/${props.comment._id.toString()}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshComments");
};
</script>

<template>
  <p class="author">{{ props.comment.author }}</p>
  <p>{{ props.comment.content }}</p>
  <div class="base">
    <menu>
      <li v-if="props.comment.author == currentUsername"><button class="btn-small pure-button" @click="emit('editComment', props.comment._id)">Edit</button></li>
      <li v-if="props.comment.author == currentUsername"><button class="button-error btn-small pure-button" @click="deleteComment">Delete</button></li>
    </menu>
    <article class="timestamp">
      <p v-if="props.comment.dateCreated !== props.comment.dateUpdated">Edited on: {{ formatDate(props.comment.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.comment.dateCreated) }}</p>
    </article>
  </div>
  <CommentListComponent :parent="props.comment._id.toString()" :comment="props.comment" @refreshComments="$emit('refreshComments')" />
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1em;
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
  padding: 0.5em;
}

/* .base article:only-child {
  margin-left: auto;
} */
</style>
