import apiClient from '../apiClient';
import type { UserDtos } from '../types/user-dtos';
import { AvailabilityStatus, ProfileVisibility } from '../types/user';

export const profileApi = {
  // Developer Profile
  getDeveloperProfile: async (userId: string) => {
    const { data } = await apiClient.get(`/developers/profile/${userId}`);
    return data;
  },

  getMyDeveloperProfile: async () => {
    const { data } = await apiClient.get('/developers/profile/me');
    return data;
  },

  createDeveloperProfile: async (request: any) => {
    const { data } = await apiClient.post('/developers/profile', request);
    return data;
  },

  updateDeveloperProfile: async (request: any) => {
    const { data } = await apiClient.put('/developers/profile', request);
    return data;
  },

  getPublicDevelopers: async (params: { page?: number; size?: number }) => {
    const { data } = await apiClient.get('/developers/public', { params });
    return data;
  },

  filterDevelopers: async (filters: any, params: { page?: number; size?: number }) => {
    const { data } = await apiClient.post('/developers/filter', filters, { params });
    return data;
  },

  getDeveloperById: async (id: string) => {
    const { data } = await apiClient.get(`/developers/${id}`);
    return data;
  },

  // Toggles
  updateAvailability: async (status: AvailabilityStatus) => {
    const { data } = await apiClient.patch(`/developers/profile/availability?status=${status}`);
    return data;
  },

  updateVisibility: async (visibility: ProfileVisibility) => {
    const { data } = await apiClient.patch(`/developers/profile/visibility?visibility=${visibility}`);
    return data;
  },

  // Editable Sections
  addSkill: async (skill: string) => {
    const { data } = await apiClient.post('/developers/profile/skills', { skill });
    return data;
  },

  removeSkill: async (skill: string) => {
    const { data } = await apiClient.delete(`/developers/profile/skills/${skill}`);
    return data;
  },

  addLanguage: async (language: string) => {
    const { data } = await apiClient.post('/developers/profile/languages', { language });
    return data;
  },

  removeLanguage: async (language: string) => {
    const { data } = await apiClient.delete(`/developers/profile/languages/${language}`);
    return data;
  },

  addEducation: async (request: any) => {
    const { data } = await apiClient.post('/developers/profile/education', request);
    return data;
  },

  removeEducation: async (id: string) => {
    const { data } = await apiClient.delete(`/developers/profile/education/${id}`);
    return data;
  },

  addCertification: async (request: any) => {
    const { data } = await apiClient.post('/developers/profile/certifications', request);
    return data;
  },

  removeCertification: async (id: string) => {
    const { data } = await apiClient.delete(`/developers/profile/certifications/${id}`);
    return data;
  },

  addOssContribution: async (request: any) => {
    const { data } = await apiClient.post('/developers/profile/oss', request);
    return data;
  },

  removeOssContribution: async (id: string) => {
    const { data } = await apiClient.delete(`/developers/profile/oss/${id}`);
    return data;
  },

  addAchievement: async (request: any) => {
    const { data } = await apiClient.post('/developers/profile/achievements', request);
    return data;
  },

  removeAchievement: async (id: string) => {
    const { data } = await apiClient.delete(`/developers/profile/achievements/${id}`);
    return data;
  },

  addProject: async (request: any) => {
    const { data } = await apiClient.post('/developers/profile/projects', request);
    return data;
  },

  updateProject: async (id: string, request: any) => {
    const { data } = await apiClient.put(`/developers/profile/projects/${id}`, request);
    return data;
  },

  removeProject: async (id: string) => {
    const { data } = await apiClient.delete(`/developers/profile/projects/${id}`);
    return data;
  },

  toggleProjectFeatured: async (id: string) => {
    const { data } = await apiClient.patch(`/developers/profile/projects/${id}/featured`);
    return data;
  },

  // Endorsements
  endorseDeveloper: async (profileId: string, content: string) => {
    const { data } = await apiClient.post(`/developers/${profileId}/endorsements`, { content });
    return data;
  },

  // Employer Profile
  getEmployerProfile: async (userId: string) => {
    const { data } = await apiClient.get(`/employers/profile/${userId}`);
    return data;
  },

  getMyEmployerProfile: async () => {
    const { data } = await apiClient.get('/employers/profile/me');
    return data;
  },

  createEmployerProfile: async (request: any) => {
    const { data } = await apiClient.post('/employers/profile', request);
    return data;
  },

  updateEmployerProfile: async (request: any) => {
    const { data } = await apiClient.put('/employers/profile', request);
    return data;
  },

  // Employer Actions (Pro/Token features)
  getBookmarks: async () => {
    const { data } = await apiClient.get('/employers/bookmarks');
    return data;
  },

  toggleBookmark: async (developerId: string, isBookmarked: boolean) => {
    if (isBookmarked) {
      const { data } = await apiClient.delete(`/employers/bookmarks/${developerId}`);
      return data;
    } else {
      const { data } = await apiClient.post(`/employers/bookmarks/${developerId}`);
      return data;
    }
  },

  getContactRequests: async () => {
    const { data } = await apiClient.get('/employers/contact/requests');
    return data;
  },

  sendContactRequest: async (developerId: string, message: string) => {
    const { data } = await apiClient.post(`/employers/contact/${developerId}`, { message });
    return data;
  },

  getSavedSearches: async () => {
    const { data } = await apiClient.get('/employers/searches');
    return data;
  },

  saveSearch: async (name: string, filterCriteria: any) => {
    const { data } = await apiClient.post('/employers/searches', { searchName: name, filterCriteria });
    return data;
  },

  deleteSavedSearch: async (id: string) => {
    const { data } = await apiClient.delete(`/employers/searches/${id}`);
    return data;
  },

  // Developer response to contact request
  respondToContactRequest: async (requestId: string, status: 'ACCEPTED' | 'DECLINED') => {
    const { data } = await apiClient.patch(`/employers/contact/requests/${requestId}`, { status });
    return data;
  },
};
