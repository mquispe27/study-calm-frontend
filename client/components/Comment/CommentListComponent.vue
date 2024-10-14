<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { defineProps, onBeforeMount, ref } from "vue";
import CommentComponent from "./CommentComponent.vue";
import CreateCommentForm from "./CreateCommentForm.vue";
import EditCommentForm from "./EditCommentForm.vue";
const { isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps<{ parent: string; post?: any; comment?: any }>();
const loaded = ref(false);
let comments = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");

async function getCommentsByParent(parent?: string) {
  let query: Record<string, string> = parent !== undefined ? { parent } : {};
  let commentResults;
  try {
    commentResults = await fetchy(`/api/comments/${parent}`, "GET", { query });
  } catch (_) {
    return;
  }
  // searchAuthor.value = author ? author : "";
  comments.value = commentResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getCommentsByParent(props.parent);
  loaded.value = true;
});
// missing SearchCommentForm below h2
</script>

<template>
  <section class="comments" v-if="loaded && comments.length !== 0">
    <CreateCommentForm :post="props.post" :comment="props.comment" @refreshComments="getCommentsByParent(props.parent)" />
    <article v-for="comment in comments" :key="comment._id" class="comment">
      <CommentComponent v-if="editing !== comment._id" :comment="comment" @editComment="updateEditing" @refreshComments="getCommentsByParent(props.parent)" />
      <EditCommentForm v-else :comment="comment" @refreshComments="getCommentsByParent(props.parent)" @editComment="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded">
    No comments found. Be the first to reply!
    <CreateCommentForm :post="props.post" :comment="props.comment" @refreshComments="getCommentsByParent(props.parent)" />
  </p>
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
