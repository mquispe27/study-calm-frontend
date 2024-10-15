<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineProps, onBeforeMount, ref } from "vue";
import CommentComponent from "./CommentComponent.vue";
import CreateCommentForm from "./CreateCommentForm.vue";
import EditCommentForm from "./EditCommentForm.vue";

const props = defineProps<{ parent: string; post?: any; comment?: any; showBox: boolean }>();
const loaded = ref(false);
let comments = ref<Array<Record<string, string>>>([]);
let editing = ref("");
const _emit = defineEmits(["hideReplyBox"]);

async function getCommentsByParent(parent?: string) {
  let commentResults;
  try {
    commentResults = await fetchy(`/api/comments/${parent}`, "GET");
  } catch (_) {
    return;
  }
  comments.value = commentResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getCommentsByParent(props.parent);
  loaded.value = true;
});
</script>

<template>
  <section class="comments" v-if="loaded && props.post && comments.length !== 0">
    <CreateCommentForm :post="props.post" :comment="props.comment" @refreshComments="getCommentsByParent(props.parent)" />
    <article v-for="comment in comments" :key="comment._id" class="comment">
      <CommentComponent v-if="editing !== comment._id" :comment="comment" @editComment="updateEditing" @refreshComments="getCommentsByParent(props.parent)" />
      <EditCommentForm v-else :comment="comment" @refreshComments="getCommentsByParent(props.parent)" @editComment="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded && props.post">
    No comments found. Be the first to reply!
    <CreateCommentForm :post="props.post" :comment="props.comment" @refreshComments="getCommentsByParent(props.parent)" />
  </p>
  <section v-else-if="loaded && props.comment">
    <CreateCommentForm v-if="showBox" :post="props.post" :comment="props.comment" @hideReplyBox="$emit('hideReplyBox')" @refreshComments="getCommentsByParent(props.parent)" />
    <article v-for="comment in comments" :key="comment._id" class="comment">
      <CommentComponent v-if="editing !== comment._id" :comment="comment" @editComment="updateEditing" @refreshComments="getCommentsByParent(props.parent)" />
      <EditCommentForm v-else :comment="comment" @refreshComments="getCommentsByParent(props.parent)" @editComment="updateEditing" />
    </article>
  </section>
  <p v-else>Loading...</p>
</template>

<style scoped>
/* section {
  display: flex;
  flex-direction: column;
  gap: 1em;
} */

/* section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
} */

/* article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
} */

/* .posts {
  padding: 1em;
} */

/* .row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
} */

.comments {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.comment {
  border-left: 2px solid #ccc;
  padding-left: 1em;
  margin-bottom: 1em;
}
</style>
