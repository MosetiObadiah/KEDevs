import apiClient from '../apiClient';
import type { UserDtos } from '../types/user-dtos';

export const profileApi = {
  // Developer Profile
  getDeveloperProfile: async (userId: string) => {
    const { data } = await apiClient.get(`/developers/profile/${userId}`);
    return data.data;
  },

  getMyDeveloperProfile: async () => {
    const { data } = await apiClient.get('/developers/profile/me');
    return data.data;
  },

  createDeveloperProfile: async (request: any) => {
    const { data } = await apiClient.post('/developers/profile', request);
    return data.data;
  },

  updateDeveloperProfile: async (request: any) => {
    const { data } = await apiClient.put('/developers/profile', request);
    return data.data;
  },

  getPublicDevelopers: async (params: { page?: number; size?: number }) => {
    const { data } = await apiClient.get('/developers/public', { params });
    return data.data;
  },

  // Employer Profile
  getEmployerProfile: async (userId: string) => {
    const { data } = await apiClient.get(`/employers/profile/${userId}`);
    return data.data;
  },

  getMyEmployerProfile: async () => {
    const { data } = await apiClient.get('/employers/profile/me');
    return data.data;
  },

  createEmployerProfile: async (request: any) => {
    const { data } = await apiClient.post('/employers/profile', request);
    return data.data;
  },

  updateEmployerProfile: async (request: any) => {
    const { data } = await apiClient.put('/employers/profile', request);
    return data.data;
  },
};
