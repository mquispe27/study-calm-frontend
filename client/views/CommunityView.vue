<script setup lang="ts">
import CommunityPostListComponent from "@/components/Community/CommunityPostListComponent.vue";
import { useCommunityStore } from "@/stores/community";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const communityStore = useCommunityStore();

const route = useRoute();
const viewMembers = ref(false);
const loading = ref(true);
const deleted = ref(false);

async function handleViewMembersClick() {
  viewMembers.value = !viewMembers.value;
}

onBeforeMount(async () => {
  if (!communityStore.selectedCommunity) {
    try {
      const community = await fetchy(`/api/groups/${route.params.id}`, "GET");
      communityStore.setSelectedCommunity(community);
    } catch (error) {
      console.error(error);
    }
  }
  loading.value = false;
});

watch(
  () => route.params.id,
  async () => {
    deleted.value = false;
    try {
      const community = await fetchy(`/api/groups/${route.params.id}`, "GET");
      communityStore.setSelectedCommunity(community);
    } catch (error) {
      console.error(error);
    }
  },
);

async function deleteCommunity() {
  if (confirm("Are you sure you want to delete this community?")) {
    try {
      await fetchy(`/api/groups/${route.params.id}`, "DELETE");
      deleted.value = true;
      communityStore.setCommunityDeleted(true);
    } catch (error) {
      console.error(error);
    }
  }
}

async function leaveCommunity() {
  if (confirm("Are you sure you want to leave this community?")) {
    try {
      await fetchy(`/api/groups/${route.params.id}/members`, "PATCH", { body: false });
      deleted.value = true;
      communityStore.setCommunityDeleted(true);
    } catch (error) {
      console.error(error);
    }
  }
}
</script>

<template>
  <main v-if="!deleted">
    <div class="headings">
      <h1>{{ communityStore.selectedCommunity?.name }}</h1>
      <p>{{ communityStore.selectedCommunity?.description }}</p>
    </div>

    <div className="joinLeaveBar">
      <RouterLink :to="{ name: 'Events', params: { id: route.params._id } }">Events Board </RouterLink>
      <p>Founder: {{ communityStore.selectedCommunity?.founder }}</p>
      <button @click="handleViewMembersClick">View Members</button>
      <div v-if="viewMembers">{{ communityStore.selectedCommunity?.members.join(", ") || "None" }}</div>
      <div v-if="currentUsername == (communityStore.selectedCommunity?.founder ?? '')">
        <button class="button-error" @click="deleteCommunity">Delete Community</button>
      </div>
      <div v-else><button class="button-error" @click="leaveCommunity">Leave Community</button></div>
    </div>
    <div v-if="!loading">
      <CommunityPostListComponent :key="communityStore.selectedCommunity?._id" :community="communityStore.selectedCommunity?._id ?? ''" :name="communityStore.selectedCommunity?.name ?? ''" />
    </div>
  </main>
  <p v-else>Community is deleted or not available!</p>
</template>

<style scoped>
h1 {
  text-align: center;
}

.joinLeaveBar {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 1rem;
  align-items: center;
}

button {
  cursor: pointer;
}

.headings {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
