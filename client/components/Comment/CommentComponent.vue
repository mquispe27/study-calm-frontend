<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import CommentListComponent from "./CommentListComponent.vue";

const props = defineProps(["comment"]);
const emit = defineEmits(["editComment", "refreshComments", "deleteComment", "createComment"]);
const { currentUsername } = storeToRefs(useUserStore());
const showReplyBox = ref(false);

const deleteComment = async () => {
  if (confirm("Are you sure you want to delete this comment?")) {
    try {
      await fetchy(`/api/comments/${props.comment._id}`, "DELETE");
    } catch {
      return;
    }
    emit("refreshComments");
  }
};

const handleReply = () => {
  showReplyBox.value = !showReplyBox.value;
};
</script>

<template>
  <p class="author">{{ props.comment.author }}</p>
  <p>{{ props.comment.content }}</p>
  <div class="base">
    <menu>
      <li v-if="props.comment.author == currentUsername"><button class="btn-small" @click="emit('editComment', props.comment._id)">Edit</button></li>
      <li v-if="props.comment.author == currentUsername"><button class="button-error btn-small" @click="deleteComment">Delete</button></li>
      <li><button class="btn-small" @click="handleReply">Reply</button></li>
    </menu>
    <article class="timestamp">
      <p v-if="props.comment.dateCreated !== props.comment.dateUpdated">Edited on: {{ formatDate(props.comment.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.comment.dateCreated) }}</p>
    </article>
  </div>
  <CommentListComponent :parent="props.comment._id.toString()" :comment="props.comment" :showBox="showReplyBox" @hideReplyBox="handleReply" @refreshComments="$emit('refreshComments')" />
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
