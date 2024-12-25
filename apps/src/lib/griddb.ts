type ColumnDefinition = {
	name: string
	type: 'STRING' | 'INTEGER' | 'TIMESTAMP'
}

type CreateContainerPayload = {
	containerName?: string
	columns?: ColumnDefinition[]
}

type Query = {
	type: string
	stmt: string
}

type Config = {
	griddbWebApiUrl: string
	username: string
	password: string
}

export function createGridDBClient(config: Config) {
	const { griddbWebApiUrl, username, password } = config
	const baseUrl = griddbWebApiUrl
	const authToken = Buffer.from(`${username}:${password}`).toString('base64')

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function makeRequest<T>(path: string, payload: any): Promise<T> {
		const response = await fetch(`${baseUrl}${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${authToken}`,
			},
			body: JSON.stringify(payload),
		})

		const responseText = await response.text()

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status} - ${responseText || response.statusText}`)
		}

		return processResponse(responseText)
	}

	function processResponse(responseText: string, successMessage = 'Operation completed successfully') {
		if (responseText) {
			try {
				return JSON.parse(responseText)
			} catch {
				return { message: successMessage, response: responseText }
			}
		}
		return { message: successMessage }
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function createContainer(payload: CreateContainerPayload = {}): Promise<any> {
		const defaultPayload = {
			container_name: payload.containerName || 'resumes',
			container_type: 'COLLECTION',
			rowkey: true,
			columns: payload.columns || [
				{ name: 'id', type: 'STRING' },
				{ name: 'rawContent', type: 'STRING' },
				{ name: 'formattedContent', type: 'STRING' },
				{ name: 'version', type: 'INTEGER' },
				{ name: 'status', type: 'STRING' },
				{ name: 'createdAt', type: 'TIMESTAMP' },
				{ name: 'updatedAt', type: 'TIMESTAMP' },
				{ name: 'userId', type: 'STRING' },
				{ name: 'template', type: 'STRING' },
				{ name: 'metadata', type: 'STRING' },
			],
		}
		try {
			return await makeRequest('/containers', defaultPayload)
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to create GridDB container: ${error.message}`)
			} else {
				throw new Error('Failed to create GridDB container: Unknown error')
			}
		}
	}

	async function insertData({
		data,
		containerName = 'resumes',
	}: {
		data: {
			id: string
			rawContent: string
			formattedContent: string
			version: number
			status: string
			createdAt: Date | string
			updatedAt: Date | string
			userId: string
			template: string
			metadata: string
		}
		containerName?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	}): Promise<any> {
		try {
			// Ensure timestamps are in ISO format
			const createdAt =
				data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt
			const updatedAt =
				data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt

			// Escape values to prevent SQL injection
			const escapedValues = [
				data.id,
				data.rawContent,
				data.formattedContent,
				data.version,
				data.status,
				createdAt,
				updatedAt,
				data.userId,
				data.template,
				data.metadata,
			].map((value) => (typeof value === 'string' ? value.replace(/'/g, "''") : value))

			// Build the SQL query
			const sql = `INSERT INTO ${containerName}(id, rawContent, formattedContent, version, status, createdAt, updatedAt, userId, template, metadata) 
VALUES('${escapedValues[0]}', '${escapedValues[1]}', '${escapedValues[2]}', ${escapedValues[3]}, '${escapedValues[4]}', TIMESTAMP('${escapedValues[5]}'), TIMESTAMP('${escapedValues[6]}'), '${escapedValues[7]}', '${escapedValues[8]}', '${escapedValues[9]}')`

			// Execute the SQL query via GridDB
			return await makeRequest('/sql/update', [{ stmt: sql }])
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to insert data: ${error.message}`)
			} else {
				throw new Error('Failed to insert data: Unknown error')
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function searchData(queries: Query[]): Promise<any> {
		try {
			if (!Array.isArray(queries) || queries.length === 0) {
				throw new Error('Queries must be a non-empty array of SQL query objects.')
			}

			return await makeRequest('/sql', queries)
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to search data: ${error.message}`)
			} else {
				throw new Error('Failed to search data: Unknown error')
			}
		}
	}

	return {
		createContainer,
		insertData,
		searchData,
	}
}