<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref } from "vue";

const userGoals = ref<string[]>([]);
const partnerGoals = ref<string[]>([]);
const newGoal = ref("");
const editingGoal = ref(<string | null>null);
const newGoalValue = ref("");
const partnerName = ref("");
const terminatedMatch = ref(false);

async function fetchUserGoals() {
  try {
    const goals = await fetchy("/api/matches/goal", "GET");
    if (goals.msg) {
      // no goals set
      return;
    }
    userGoals.value = goals;
  } catch (error) {
    console.error("Failed to fetch user goals:", error);
  }
}

async function getPartnerName() {
  try {
    const partner = await fetchy("/api/matches/", "GET");
    partnerName.value = partner.name;
  } catch (error) {
    console.error("Failed to fetch partner name:", error);
  }
}

async function fetchPartnerGoals() {
  try {
    const goals = await fetchy("/api/matches/goal/partner", "GET");
    if (goals.msg) {
      // no goals set
      return;
    }
    partnerGoals.value = goals;
  } catch (error) {
    console.error("Failed to fetch partner goals:", error);
  }
}

async function addGoal(newAddGoal: string) {
  if (newGoal.value.trim() === "") return;
  try {
    await fetchy("/api/matches/goal", "PUT", { body: { goal: newAddGoal } });
    userGoals.value.push(newAddGoal);
    newGoal.value = "";
  } catch (error) {
    console.error("Failed to add goal:", error);
  }
}

async function editGoal(goal: string) {
  if (newGoalValue.value && newGoalValue.value.trim() !== "") {
    try {
      await fetchy("/api/matches/goal", "PATCH", { body: { oldGoal: goal, newGoal: newGoalValue.value } });
      const index = userGoals.value.indexOf(goal);
      if (index !== -1) {
        userGoals.value[index] = newGoalValue.value;
      }
    } catch (error) {
      console.error("Failed to edit goal:", error);
    }
  }
}

function startEditGoal(goal: string) {
  editingGoal.value = goal;
  newGoalValue.value = goal;
}

function cancelEdit() {
  editingGoal.value = null;
  newGoalValue.value = "";
}

async function deleteGoal(goal: string) {
  if (confirm("Are you sure you want to delete this goal?")) {
    try {
      await fetchy("/api/matches/goal/remove", "PATCH", { body: { goal } });
      userGoals.value = userGoals.value.filter((g) => g !== goal);
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  }
}

async function terminateMatch() {
  try {
    await fetchy("/api/matches/", "DELETE");
    userGoals.value = [];
    partnerGoals.value = [];
    terminatedMatch.value = true;
  } catch (error) {
    console.error("Failed to terminate match:", error);
  }
}

onMounted(async () => {
  await fetchUserGoals();
  await fetchPartnerGoals();
  await getPartnerName();
});
</script>

<template>
  <div>
    <div class="match-interaction" v-if="terminatedMatch">
      <p>Your match has been terminated. Please return to the home page.</p>
    </div>
    <div class="match-interaction" v-else>
      <h1>Matched with {{ partnerName }}</h1>
      <h2>Your Goals</h2>
      <ul>
        <div>
          <p v-if="userGoals.length === 0">You have not set any goals yet. Add a goal now so your partner can cheer you on and hold you accountable!</p>
        </div>
        <li v-for="goal in userGoals" :key="goal">
          <div v-if="editingGoal === goal">
            <input v-model="newGoalValue" placeholder="Edit goal" />
            <button class="btn-small pure-button-primary pure-button" @click="editGoal(goal)">Save</button>
            <button class="btn-small pure-button" @click="cancelEdit">Cancel</button>
          </div>
          <div v-else>
            {{ goal }}
            <button class="btn-small pure-button" @click="startEditGoal(goal)">Edit</button>
            <button class="btn-small pure-button-primary pure-button button-error" @click="deleteGoal(goal)">Delete</button>
          </div>
        </li>
      </ul>
      <textarea v-model="newGoal" placeholder="Add a new goal, hope, dream, or wish your partner well!"></textarea>
      <button class="pure-button-primary pure-button" @click="addGoal(newGoal)">Add Goal</button>
      <h2>Partner's Goals</h2>
      <p v-if="partnerGoals.length === 0">Your partner has not set any goals yet. Encourage them to add some!</p>
      <ul>
        <li v-for="goal in partnerGoals" :key="goal">{{ goal }}</li>
      </ul>
      <p>Not happy?</p>
      <button type="submit" class="pure-button button-error" @click="terminateMatch">Terminate Match</button>
    </div>
  </div>
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

.match-interaction {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

.match-interaction h2 {
  margin-top: 0;
}

.match-interaction ul {
  list-style-type: none;
  padding: 0;
}

.match-interaction li {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.match-interaction button {
  margin-left: 10px;
}

textarea {
  width: 30%;
  height: 100px;
  border-radius: 5px;
  padding: 10px;
  resize: none;
}
</style>
