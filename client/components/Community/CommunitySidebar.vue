<script setup lang="ts">
import { useCommunityStore } from "@/stores/community";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const communityStore = useCommunityStore();

const loaded = ref(false);
async function getUserCommunities() {
  let communityResults;
  try {
    communityResults = await fetchy("/api/groups", "GET", { query: { member: currentUsername.value } });
  } catch (_) {
    return;
  }
  communityStore.setCommunities(communityResults);
}

onBeforeMount(async () => {
  await getUserCommunities();
  loaded.value = true;
});

watch(isLoggedIn, async (newVal) => {
  if (newVal) {
    await getUserCommunities();
  } else {
    communityStore.setCommunities([]);
  }
});

watch(
  () => communityStore.communityCreated,
  async (newVal) => {
    if (newVal) {
      await getUserCommunities();
      communityStore.setCommunityCreated(false);
    }
  },
);
watch(
  () => communityStore.communityDeleted,
  async (newVal) => {
    if (newVal) {
      await getUserCommunities();
      communityStore.setCommunityDeleted(false);
    }
  },
);
</script>

<template>
  <div class="Sidebar">
    <h2>Communities</h2>
    <ul v-if="communityStore.communities.length !== 0" @createCommunitySuccess="getUserCommunities">
      <li v-for="community in communityStore.communities" :key="community._id">
        <RouterLink :to="{ name: 'CommunityView', params: { id: community._id } }" @click="communityStore.setSelectedCommunity(community)">
          <div>{{ community.name }}</div>
        </RouterLink>
      </li>
    </ul>
    <ul v-else-if="loaded">
      No communities found. Join a community now!
    </ul>
    <RouterLink :to="{ name: 'BrowseCommunities' }">
      <div>Browse communities</div>
    </RouterLink>
    <RouterLink :to="{ name: 'CreateCommunity' }">
      <div>Create a community</div>
    </RouterLink>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #f4f4f4;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar h2 {
  margin-top: 0;
  font-size: 1.5em;
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
}

.sidebar li {
  margin: 10px 0;
  padding: 10px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
