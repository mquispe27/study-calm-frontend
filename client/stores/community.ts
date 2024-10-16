import { ObjectId } from "mongodb";
import { defineStore } from "pinia";

type Community = {
  _id: string;
  name: string;
  description?: string;
  founder: ObjectId;
  members: ObjectId[];
  content: ObjectId[];
};

export const useCommunityStore = defineStore("community", {
  state: (): { communities: Community[]; selectedCommunity: Community | null; communityCreated: boolean; communityDeleted: boolean } => ({
    communities: [],
    selectedCommunity: null,
    communityCreated: false,
    communityDeleted: false,
  }),
  actions: {
    setCommunities(communities: Community[]) {
      this.communities = communities;
    },
    setSelectedCommunity(community: Community | null) {
      this.selectedCommunity = community;
    },
    loadSelectedCommunity() {
      const community = localStorage.getItem("selectedCommunity");
      if (community) {
        this.selectedCommunity = JSON.parse(community);
      }
    },
    setCommunityCreated(created: boolean) {
      this.communityCreated = created;
    },
    setCommunityDeleted(deleted: boolean) {
      this.communityDeleted = deleted;
    },
  },
});
