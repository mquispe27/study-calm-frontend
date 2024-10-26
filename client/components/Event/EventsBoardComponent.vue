<script setup lang="ts">
import { useCommunityStore } from "@/stores/community";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const route = useRoute();
const communityStore = useCommunityStore();
const { selectedCommunity } = storeToRefs(communityStore);
const loaded = ref(false);
const events = ref<any[]>([]);
const newEventName = ref("");
const newEventTime = ref("");
const newEventLocation = ref("");
const editingEvent = ref<string | null>(null);
const newEventNameEdit = ref("");
const newTime = ref("");
const newLocation = ref("");
const userVotes = ref<{ [key: string]: any }>({});
const voteCounts = ref<{ [key: string]: { times: { [key: string]: string[] }; locations: { [key: string]: string[] } } }>({});

async function fetchCommunity() {
  if (!selectedCommunity.value) {
    try {
      const community = await fetchy(`/api/groups/${route.params.id}`, "GET");
      communityStore.setSelectedCommunity(community);
    } catch (error) {
      console.error(error);
    }
  }
}

async function browseEvents() {
  let eventResults;
  try {
    eventResults = await fetchy(`/api/events/group/${route.params.id}`, "GET");
    events.value = eventResults.events;
    await fetchAllVotes();
  } catch (error) {
    console.error("Failed to fetch events", error);
    events.value = [];
  } finally {
    loaded.value = true;
  }
}

async function createEvent() {
  if (!newEventName.value || !newEventTime.value || !newEventLocation.value) return;
  try {
    await fetchy("/api/events", "POST", {
      body: {
        group: selectedCommunity.value?._id || "",
        time: newEventTime.value,
        location: newEventLocation.value,
        eventName: newEventName.value,
      },
    });
    await browseEvents();
    newEventName.value = "";
    newEventTime.value = "";
    newEventLocation.value = "";
  } catch (error) {
    console.error("Failed to create event:", error);
  }
}

async function joinEvent(eventId: string) {
  try {
    await fetchy(`/api/events/${eventId}/members`, "PATCH", { body: { join: true } });
    await browseEvents();
  } catch (error) {
    console.error("Failed to join event", error);
  }
}

async function leaveEvent(eventId: string) {
  try {
    await fetchy(`/api/events/${eventId}/members`, "PATCH", { body: { join: false } });
    await browseEvents();
    userVotes.value[eventId] = null;
  } catch (error) {
    console.error("Failed to leave event", error);
  }
}

async function deleteEvent(eventId: string) {
  if (!confirm("Are you sure you want to delete this event?")) return;
  try {
    await fetchy(`/api/events/${eventId}`, "DELETE");
    userVotes.value[eventId] = null;
    await browseEvents();
  } catch (error) {
    console.error("Failed to delete event", error);
  }
}

function startEdit(eventId: string, eventName: string) {
  editingEvent.value = eventId;
  newEventNameEdit.value = eventName;
}

function cancelEdit() {
  editingEvent.value = null;
  newEventNameEdit.value = "";
}

async function saveEventNameEdit(eventId: string) {
  if (!newEventNameEdit.value.trim()) return;
  try {
    await fetchy(`/api/events/${eventId}/name`, "PATCH", { body: { name: newEventNameEdit.value } });
    await browseEvents();
    editingEvent.value = null;
    newEventNameEdit.value = "";
  } catch (error) {
    console.error("Failed to update event name", error);
  }
}

async function suggestTime(eventId: string) {
  if (!newTime.value) return;
  try {
    await fetchy(`/api/events/${eventId}/time`, "POST", { body: { time: newTime.value } });
    await browseEvents();
    await getUserVotes(eventId);
    await fetchAllVotes();
    newTime.value = "";
  } catch (error) {
    console.error("Failed to suggest time", error);
  }
}

async function voteTime(eventId: string, time: string) {
  try {
    await fetchy(`/api/events/${eventId}/time/vote`, "POST", { body: { time } });
    await browseEvents();
    await getUserVotes(eventId);
    await fetchAllVotes();
  } catch (error) {
    console.error("Failed to vote on time", error);
  }
}

async function unvoteTime(eventId: string, time: string) {
  try {
    await fetchy(`/api/events/${eventId}/time/vote`, "PATCH", { body: { time } });
    await browseEvents();
    await getUserVotes(eventId);
    await fetchAllVotes();
  } catch (error) {
    console.error("Failed to unvote on time", error);
  }
}

async function removeTime(eventId: string, time: string) {
  try {
    await fetchy(`/api/events/${eventId}/time`, "PATCH", { body: { time } });
    await browseEvents();
    await getUserVotes(eventId);
    await fetchAllVotes();
  } catch (error) {
    console.error("Failed to remove time", error);
  }
}

async function suggestLocation(eventId: string) {
  if (!newLocation.value.trim()) return;
  try {
    await fetchy(`/api/events/${eventId}/location`, "POST", { body: { location: newLocation.value } });
    await browseEvents();
    await getUserVotes(eventId);
    await fetchAllVotes();
    newLocation.value = "";
  } catch (error) {
    console.error("Failed to suggest location", error);
  }
}

async function voteLocation(eventId: string, location: string) {
  try {
    await fetchy(`/api/events/${eventId}/location/vote`, "POST", { body: { location } });
    await browseEvents();
    await getUserVotes(eventId);
  } catch (error) {
    console.error("Failed to vote on location", error);
  }
}

async function unvoteLocation(eventId: string, location: string) {
  try {
    await fetchy(`/api/events/${eventId}/location/vote`, "PATCH", { body: { location } });
    await browseEvents();
    await getUserVotes(eventId);
    await fetchAllVotes();
  } catch (error) {
    console.error("Failed to unvote on location", error);
  }
}

async function removeLocation(eventId: string, location: string) {
  try {
    await fetchy(`/api/events/${eventId}/location`, "PATCH", { body: { location } });
    await browseEvents();
    await getUserVotes(eventId);
    await fetchAllVotes();
  } catch (error) {
    console.error("Failed to remove location", error);
  }
}

async function getUserVotes(eventId: string) {
  try {
    const votes = await fetchy(`/api/events/${eventId}/votes`, "GET");
    userVotes.value[eventId] = votes;
  } catch (error) {
    console.error("Failed to get user votes", error);
  }
}

async function fetchAllVotes() {
  for (const event of events.value) {
    try {
      const votes = await fetchy(`/api/events/${event._id}/allVotes`, "GET");
      voteCounts.value[event._id] = votes;
      console.log(votes);
    } catch (error) {
      console.error("Failed to fetch votes", error);
    }
  }
}

onBeforeMount(async () => {
  await fetchCommunity();
  await browseEvents();
  for (const event of events.value) {
    await getUserVotes(event._id);
  }
});
// Watch for changes in the selected community and fetch events
watch(selectedCommunity, async (newCommunity) => {
  if (newCommunity?._id) {
    await browseEvents();
  }
});
</script>

<template>
  <div v-if="loaded">
    <section>
      <h2>{{ communityStore.selectedCommunity?.name }} Events</h2>
    </section>
    <section class="events" v-if="events?.length > 0">
      <article v-for="event in events" :key="event._id">
        <div class="row">
          <div v-if="editingEvent === event._id">
            <input v-model="newEventNameEdit" placeholder="Edit event name" />
            <button class="pure-button-primary" @click="saveEventNameEdit(event._id)">Save</button>
            <button @click="cancelEdit">Cancel</button>
          </div>
          <div v-else>
            <h3>{{ event.name }}</h3>
          </div>
          <div v-if="event.attendees.includes(currentUsername)">
            <div v-if="event.creator.username === currentUsername">
              <button @click="startEdit(event._id, event.name)">Edit Name</button>
              <button class="pure-button-primary button-error" @click="deleteEvent(event._id)">Delete</button>
            </div>
            <div v-else>
              <button class="button-error" @click="leaveEvent(event._id)">Leave</button>
            </div>
          </div>
          <div v-else>
            <button class="pure-button-primary" @click="joinEvent(event._id)">Join</button>
          </div>
        </div>
        <p>Time: {{ new Date(event.time).toLocaleString() }}</p>
        <p>Location: {{ event.location }}</p>
        <div>
          <p v-if="event.creator.username == currentUsername">Attendees: {{ event.attendees.join(", ") || "None" }}</p>
          <div v-else>
            <p>Number of Attendees: {{ event.attendees.length }}</p>
            <p>(Only creator can view attendee list.)</p>
          </div>
        </div>
        <div v-if="event.attendees.includes(currentUsername)">
          <div>
            <h4>Suggested Times</h4>
            <ul>
              <li v-for="time in event.possibleTimes" :key="time">
                {{ new Date(time).toLocaleString() }}
                (Votes: {{ voteCounts[event._id]?.times[new Date(time).toString()]?.length || 0 }})
                <div class="voteRemovePane">
                  <div v-if="new Date(userVotes[event._id]?.time).toLocaleString() === new Date(time).toLocaleString()">
                    <button class="btn-small" @click="unvoteTime(event._id, time)">Unvote</button>
                  </div>
                  <div v-else>
                    <button class="btn-small" @click="voteTime(event._id, time)">Vote</button>
                  </div>
                  <button v-if="event.creator.username == currentUsername" class="btn-small button-error" @click="removeTime(event._id, time)">Remove</button>
                </div>
              </li>
            </ul>
            <input v-model="newTime" type="datetime-local" placeholder="Suggest a new time" />
            <button class="pure-button-primary" @click="suggestTime(event._id)">Suggest Time</button>
          </div>
          <div>
            <h4>Suggested Locations</h4>
            <ul>
              <li v-for="location in event.possibleLocations" :key="location">
                {{ location }} (Votes: {{ voteCounts[event._id]?.locations[location]?.length || 0 }})
                <div class="voteRemovePane">
                  <div v-if="userVotes[event._id]?.location === location">
                    <button class="btn-small" @click="unvoteLocation(event._id, location)">Unvote</button>
                  </div>
                  <div v-else>
                    <button class="btn-small" @click="voteLocation(event._id, location)">Vote</button>
                  </div>
                  <button v-if="event.creator.username == currentUsername" class="btn-small button-error" @click="removeLocation(event._id, location)">Remove</button>
                </div>
              </li>
            </ul>
            <input v-model="newLocation" placeholder="Suggest a new location" />
            <button class="pure-button-primary" @click="suggestLocation(event._id)">Suggest Location</button>
          </div>
        </div>
      </article>
    </section>
    <p v-else>No events available to join. Stay tuned!</p>
    <form @submit.prevent="createEvent">
      <h3>Create Event</h3>
      <input v-model="newEventName" placeholder="Event Name" required />
      <input v-model="newEventTime" type="datetime-local" placeholder="Event Time" required />
      <input v-model="newEventLocation" placeholder="Event Location" required />
      <button type="submit" class="pure-button-primary">Create Event</button>
    </form>
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

.events {
  padding: 20px;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* button {
  margin-left: 10px;
} */

form {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 0 auto;
}

.voteRemovePane {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 1em;
  margin-bottom: 1em;
}
</style>
