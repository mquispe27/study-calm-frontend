<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post", "comment"]);
const commentContent = ref("");
const emit = defineEmits(["refreshComments", "hideReplyBox"]);

const createComment = async (content: string) => {
  try {
    await fetchy("/api/comments", "POST", {
      body: { content, parent: props.post ? props.post._id : props.comment._id },
    });
  } catch (_) {
    return;
  }
  emit("refreshComments");
  emit("hideReplyBox");
  emptyForm();
};

const emptyForm = () => {
  commentContent.value = "";
};
</script>

<template>
  <form @submit.prevent="createComment(commentContent)">
    <textarea id="content" v-model="commentContent" placeholder="Write a comment!" required> </textarea>
    <button type="submit" class="pure-button-primary">Comment</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  border-radius: 4px;
  resize: none;
}

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

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}
</style>
