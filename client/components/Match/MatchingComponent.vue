<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import MatchInteractionComponent from "./MatchInteractionComponent.vue";

const { currentUsername } = storeToRefs(useUserStore());

const finishedMatching = ref(false);
const isMatched = ref(false);
const inPool = ref(false);

async function checkIfMatched() {
  const match = await fetchy("/api/matches", "GET");
  return match.match;
}

async function checkIfInPool() {
  const match = await fetchy("/api/matches", "GET");
  return match.userInPool;
}

async function matchUser() {
  const matchOutcome = await fetchy("/api/matches/request", "POST");
  if (matchOutcome.match) {
    finishedMatching.value = true;
    isMatched.value = true;
  } else {
    inPool.value = true;
  }
}

async function removeFromPool() {
  await fetchy("/api/matches/request", "DELETE");
  inPool.value = false;
}

onBeforeMount(async () => {
  if (await checkIfMatched()) {
    isMatched.value = true;
  }
  if (await checkIfInPool()) {
    inPool.value = true;
  }
});
</script>

<template>
  <div>
    <div v-if="isMatched">
      <MatchInteractionComponent />
    </div>
    <div v-else>
      <div v-if="inPool">
        <p>You are in the matching pool. Please wait for a match.</p>
        <button @click="removeFromPool">Remove Me From Pool</button>
      </div>
      <div v-else>
        <p>You do not have a match yet. Would you like to be added to the matching pool?</p>
        <button @click="matchUser">Match Me</button>
      </div>
    </div>
  </div>
</template>
