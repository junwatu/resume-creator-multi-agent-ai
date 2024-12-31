export function createGridDBClient(config) {
    const { griddbWebApiUrl, username, password } = config;
    const baseUrl = griddbWebApiUrl;
    const authToken = Buffer.from(`${username}:${password}`).toString('base64');
    // Utility to make HTTP requests
    async function makeRequest(path, payload) {
        const response = await fetch(`${baseUrl}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${authToken}`,
            },
            body: JSON.stringify(payload),
        });
        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${responseText || response.statusText}`);
        }
        return parseResponse(responseText);
    }
    // Utility to parse HTTP responses
    function parseResponse(responseText, successMessage = 'Operation completed successfully') {
        try {
            return responseText ? JSON.parse(responseText) : { message: successMessage };
        }
        catch {
            return { message: successMessage, response: responseText };
        }
    }
    // Utility to format dates to ISO strings
    function formatDate(value) {
        return value instanceof Date ? value.toISOString() : value;
    }
    // Utility to escape string values for SQL
    function escapeString(value) {
        return value.replace(/'/g, "''");
    }
    // Handle errors uniformly
    function wrapError(error, defaultMessage) {
        if (error instanceof Error) {
            throw new Error(`${defaultMessage}: ${error.message}`);
        }
        throw new Error(`${defaultMessage}: Unknown error`);
    }
    // Create a GridDB container
    async function createContainer() {
        const payload = {
            container_name: 'resumes',
            container_type: 'COLLECTION',
            rowkey: true,
            columns: [
                { name: 'id', type: 'INTEGER' },
                { name: 'rawContent', type: 'STRING' },
                { name: 'formattedContent', type: 'STRING' },
                { name: 'status', type: 'STRING' },
                { name: 'createdAt', type: 'TIMESTAMP' },
                { name: 'updatedAt', type: 'TIMESTAMP' },
            ],
        };
        try {
            return await makeRequest('/containers', payload);
        }
        catch (error) {
            wrapError(error, 'Failed to create GridDB container');
        }
    }
    // Insert data into a GridDB container
    async function insertData({ data, containerName = 'resumes', }) {
        try {
            const escapedValues = [
                data.id,
                data.rawContent,
                data.formattedContent,
                data.status,
                formatDate(data.createdAt),
                formatDate(data.updatedAt),
            ].map((value) => (typeof value === 'string' ? escapeString(value) : value));
            const sql = `INSERT INTO ${containerName}(id, rawContent, formattedContent, status, createdAt, updatedAt) 
VALUES('${escapedValues.join("', '")}')`;
            return await makeRequest('/sql/update', [{ stmt: sql }]);
        }
        catch (error) {
            wrapError(error, 'Failed to insert data');
        }
    }
    // Execute SQL queries against GridDB
    async function searchData(queries) {
        if (!Array.isArray(queries) || queries.length === 0) {
            throw new Error('Queries must be a non-empty array of SQL query objects.');
        }
        try {
            return await makeRequest('/sql', queries);
        }
        catch (error) {
            wrapError(error, 'Failed to search data');
        }
    }
    return { createContainer, insertData, searchData };
}
