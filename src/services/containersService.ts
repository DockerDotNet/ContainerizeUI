import apiClient from "@/api/apiClient";
import { WSClient } from "@/api/wsClient";

const ContainersService = {
  listContainers: (params?: { all?: boolean; sortField?: string; sortOrder?: string }) => {
    return apiClient.get("/containers", {
        params: { all: true, ...params },
      });
  },

  startContainer: (id: string) => {
    return apiClient.post(`/containers/${id}/start`);
  },

  stopContainer: (id: string) => {
    return apiClient.post(`/containers/${id}/stop`);
  },

  removeContainer: (id: string, force = false) => {
    return apiClient.delete(`/containers/${id}?force=${force}`);
  },

  inspectContainer: (id: string) => {
    return apiClient.get(`/containers/${id}/json`);
  },

  streamLogs: (id: string) => {
    return new WSClient(`/containers/${id}/logs`);
  },

  streamStats: (id: string) => {
    return new WSClient(`/containers/${id}/stats`);
  },
};

export default ContainersService;
