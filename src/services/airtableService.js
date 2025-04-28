import axios from 'axios';

const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const airtableService = {
  async getAllRecords(tableName, params = {}) {
    let allRecords = [];
    let offset = null;

    do {
      const response = await api.get(`/${encodeURIComponent(tableName)}`, {
        params: { ...params, offset },
      });
      allRecords = allRecords.concat(response.data.records);
      offset = response.data.offset;
    } while (offset);

    return allRecords;
  },

  async createRecord(tableName, data) {
    const records = [
      {
        fields: data,
      },
    ];
    const response = await api.post(`/${encodeURIComponent(tableName)}`, { records });
    return response.data;
  },

  async updateRecord(tableName, recordId, data) {
    const response = await api.patch(
      `/${encodeURIComponent(tableName)}/${recordId}`,
      { fields: data }
    );
    return response.data;
  },

  async deleteRecord(tableName, recordId) {
    await api.delete(`/${encodeURIComponent(tableName)}/${recordId}`);
  },
};
