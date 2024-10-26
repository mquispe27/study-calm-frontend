<script setup lang="ts">
import { useCommunityStore } from "@/stores/community";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());
const communityStore = useCommunityStore();
const loaded = ref(false);
const communities = ref<any[]>([]);

async function browseCommunities() {
  let communityResults;
  try {
    communityResults = await fetchy("/api/groups/unjoined", "GET");
    communities.value = communityResults;
  } catch (error) {
    console.error("Failed to fetch communities", error);
    communities.value = [];
    return;
  }
}

async function joinCommunity(community: string) {
  try {
    await fetchy(`/api/groups/${community}/members`, "PATCH", { body: { join: true } });
    await browseCommunities();
    communityStore.setCommunityCreated(true);
  } catch (error) {
    console.error("Failed to join community", error);
  }
}

onBeforeMount(async () => {
  await browseCommunities();
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded">
    <section>
      <h2>Check out the communities you haven't joined!</h2>
    </section>
    <section class="communities" v-if="communities && communities.length !== 0">
      <article v-for="community in communities" :key="community._id">
        <div class="row">
          <h3>{{ community.name }}</h3>
          <p>{{ community.description }}</p>
          <h3>Members: {{ community.members.length }}</h3>
          <h3>Posts: {{ community.content.length }}</h3>
          <button @click="joinCommunity(community._id)">Join</button>
        </div>
      </article>
    </section>
    <p v-else>No communities available to join. Stay tuned! Or create one yourself!</p>
  </div>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
  flex-direction: column;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
