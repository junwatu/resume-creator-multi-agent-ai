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

	//debug
	console.log(griddbWebApiUrl, username, password);

	const baseUrl = griddbWebApiUrl;
	const authToken = Buffer.from(`${username}:${password}`).toString('base64');

	async function makeRequest(path, payload) {
		const response = await fetch(`${baseUrl}${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Basic ${authToken}`,
			},
			body: JSON.stringify(payload),
		});

		const responseText = await response.text();

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status} - ${responseText || response.statusText}`);
		}

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
			{ name: 'information', type: 'STRING' },
		],
	} = {}) {
		const payload = {
			container_name: containerName,
			container_type: 'COLLECTION',
			rowkey: true,
			columns,
		};

		try {
			return await makeRequest('/containers', payload);
		} catch (error) {
			throw new Error(`Failed to create GridDB container: ${error.message}`);
		}
	}

	async function insertData({
		data,
		containerName = 'resumes',
	}) {

		console.log(data);
		try {
			const timestamp = data.createdAt instanceof Date
				? data.createdAt.toISOString()
				: data.createdAt;

			const escapedValues = [
				parseInt(data.id),
				data.rawContent,
				data.formattedContent,
				data.status,
				timestamp,
				data.information,
			].map(value => value.toString().replace(/'/g, "''"));

			const sql = `insert into ${containerName}(id, rawContent, formattedContent, status, createdAt, information) values(${escapedValues[0]}, '${escapedValues[1]}', '${escapedValues[2]}', '${escapedValues[3]}', TIMESTAMP('${escapedValues[4]}'), '${escapedValues[5]}')`;

			return await makeRequest('/sql/update', [{ stmt: sql }]);
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
		try {
			if (!Array.isArray(queries) || queries.length === 0) {
				throw new Error('Queries must be a non-empty array of SQL query objects.');
			}

			return await makeRequest('/sql', queries);
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
