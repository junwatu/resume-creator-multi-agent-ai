/**
 * Creates a GridDB client for making API requests
 * @param {Object} config Configuration object
 * @param {string} config.griddbWebApiUrl - The GridDB Web API URL
 * @param {string} config.username - GridDB username
 * @param {string} config.password - GridDB password
 * @returns {Object} The GridDB client
 */
export function createGridDBClient(config) {
	const { griddbWebApiUrl, username, password } = config;

	const baseUrl = griddbWebApiUrl;
	const authToken = Buffer.from(`${username}:${password}`).toString('base64');
	//const authToken = `${username}:${password}`;

	async function makeRequest(path, payload, method) {
		console.log(`path: ${baseUrl}${path}`);
		console.log(`authToken: ${authToken}`);
		const response = await fetch(`${baseUrl}${path}`, {
			method: method || 'POST',
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
				'Authorization': `Basic ${authToken}`,
			},
			body: JSON.stringify(payload),
		});

		const responseText = await response.text();

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status} - ${responseText || response.statusText}`);
		}

		console.log(`Response: ${responseText}`);

		return processResponse(responseText);
	}

	function processResponse(responseText, successMessage = 'Operation completed successfully') {
		if (responseText) {
			try {
				return JSON.parse(responseText);
			} catch {
				return { message: successMessage, response: responseText };
			}
		}
		return { message: successMessage };
	}

	async function createContainer({
		containerName = 'resumes',
		columns = [
			{ name: 'id', type: 'INTEGER' },
			{ name: 'rawContent', type: 'STRING' },
			{ name: 'formattedContent', type: 'STRING' },
			{ name: 'status', type: 'STRING' },
			{ name: 'createdAt', type: 'TIMESTAMP' },
			{ name: 'information', type: 'STRING' }
		],
	} = {}) {
		const payload = {
			container_name: containerName,
			container_type: 'COLLECTION',
			rowkey: true,
			columns,
		};

		const existingContainerUrl = `/containers/${containerName}/info`;

		try {
			fetch(`${baseUrl}${existingContainerUrl}`, {
				method: 'GET',
				headers: {
					'Authorization': `Basic ${authToken}`,
				}
			}).then(async response => {
				if (response.status === 404) {
					return await makeRequest('/containers', payload);
				} else {
					console.log(`Container ${containerName} already exists`);
				}
			});
		} catch (error) {
			throw new Error(`Failed to create GridDB container: ${error.message}`);
		}
	}


	async function insertData({
		data,
		containerName = 'resumes'
	}) {

		console.log(data);
		try {
			const timestamp = data.createdAt instanceof Date
				? data.createdAt.toISOString()
				: data.createdAt;

			const row = [
				parseInt(data.id),           // INTEGER
				data.rawContent,             // STRING
				data.formattedContent,       // STRING
				data.status,                 // STRING
				timestamp,                   // TIMESTAMP (ISO format)
				data.information             // STRING
			];

			const path = `/containers/${containerName}/rows`;

			return await makeRequest(path, [row], 'PUT');
		} catch (error) {
			throw new Error(`Failed to insert data: ${error.message}`);
		}
	}


	/**
  * Searches data in GridDB using SQL queries
  * @param {Object[]} queries - List of SQL queries to execute
  * @param {string} queries[].type - Type of the query (e.g., "sql-select")
  * @param {string} queries[].stmt - SQL statement to execute
  * @returns {Promise<Object>} Response from the GridDB Web API
  */
	async function searchData(queries) {
		console.log(queries);
		try {
			if (!Array.isArray(queries) || queries.length === 0) {
				throw new Error('Queries must be a non-empty array of SQL query objects.');
			}

			return await makeRequest('/sql/dml/query', queries);
		} catch (error) {
			throw new Error(`Failed to search data: ${error.message}`);
		}
	}

	return {
		createContainer,
		insertData,
		searchData,
	};
}
