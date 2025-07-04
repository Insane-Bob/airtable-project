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
                params: {...params, offset},
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
        try {
            const response = await api.post(`/${encodeURIComponent(tableName)}`, {records});
            return response.data;
        } catch (error) {
            console.error("Airtable createRecord error:", error.response?.data || error.message);
            throw error;
        }
    },


    async updateRecord(tableName, recordId, data) {
        const response = await api.patch(
            `/${encodeURIComponent(tableName)}/${recordId}`,
            {fields: data}
        );
        return response.data;
    },

    async deleteRecord(tableName, recordId) {
        await api.delete(`/${encodeURIComponent(tableName)}/${recordId}`);
    },

    async getRecordById(tableName, recordId) {
        const response = await api.get(`/${encodeURIComponent(tableName)}/${recordId}`);
        return response.data;
    },

    async getProjectBySlug(slug) {
        const params = {
            filterByFormula: `{Slug} = "${slug}"`,
            maxRecords: 1,
        };
        const records = await this.getAllRecords('Projects', params);
        return records.length > 0 ? records[0] : null;
    }
};
