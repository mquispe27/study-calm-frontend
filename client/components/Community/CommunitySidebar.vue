<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let communities = ref<Array<Record<string, string>>>([]);

async function getUserCommunities() {
  let communityResults;
  try {
    communityResults = await fetchy("/api/groups", "GET", { query: { member: currentUsername.value } });
  } catch (_) {
    return;
  }
  communities.value = communityResults;
}

onBeforeMount(async () => {
  await getUserCommunities();
  loaded.value = true;
});

watch(isLoggedIn, async (newVal) => {
  if (newVal) {
    await getUserCommunities();
  } else {
    communities.value = [];
  }
});
</script>

<template>
  <div class="Sidebar">
    <h2>Communities</h2>
    <ul v-if="communities.length !== 0">
      <li v-for="community in communities" :key="community._id">
        <RouterLink :to="{ name: 'CommunityView', params: { id: community._id }, query: { name: community.name } }">
          <div>{{ community.name }}</div>
        </RouterLink>
      </li>
    </ul>
    <ul v-else-if="loaded">
      No communities found. Join a community now!
    </ul>
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
