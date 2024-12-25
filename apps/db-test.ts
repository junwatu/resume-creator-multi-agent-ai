import { createGridDBClient } from './src/lib/griddb'

// Define types
type DummyData = {
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

// Validate environment variables
const { GRIDDB_WEBAPI_URL, GRIDDB_USERNAME, GRIDDB_PASSWORD } = process.env
if (!GRIDDB_WEBAPI_URL || !GRIDDB_USERNAME || !GRIDDB_PASSWORD) {
	throw new Error('Missing required environment variables.')
}

const griddb = createGridDBClient({
	griddbWebApiUrl: GRIDDB_WEBAPI_URL,
	username: GRIDDB_USERNAME,
	password: GRIDDB_PASSWORD,
})

// Dummy data set for insertion
const dummyDataSet: DummyData[] = [
	{
		id: '001',
		rawContent: 'Raw content for resume 001',
		formattedContent: 'Formatted content for resume 001',
		version: 1,
		status: 'active',
		createdAt: new Date('2023-01-15T10:30:00Z'),
		updatedAt: new Date('2023-02-15T12:00:00Z'),
		userId: 'user001',
		template: 'templateA',
		metadata: JSON.stringify({ tags: ['developer', 'javascript'] }),
	},
	{
		id: '002',
		rawContent: 'Raw content for resume 002',
		formattedContent: 'Formatted content for resume 002',
		version: 2,
		status: 'inactive',
		createdAt: new Date('2023-03-22T14:45:00Z'),
		updatedAt: new Date('2023-04-22T15:30:00Z'),
		userId: 'user002',
		template: 'templateB',
		metadata: JSON.stringify({ tags: ['designer', 'photoshop'] }),
	},
	{
		id: '003',
		rawContent: 'Raw content for resume 003',
		formattedContent: 'Formatted content for resume 003',
		version: 3,
		status: 'archived',
		createdAt: new Date('2023-06-10T09:00:00Z'),
		updatedAt: new Date('2023-07-10T10:00:00Z'),
		userId: 'user003',
		template: 'templateC',
		metadata: JSON.stringify({ tags: ['manager', 'project management'] }),
	},
	{
		id: '004',
		rawContent: 'Raw content for resume 004',
		formattedContent: 'Formatted content for resume 004',
		version: 1,
		status: 'active',
		createdAt: new Date('2023-07-18T16:20:00Z'),
		updatedAt: new Date('2023-08-18T17:00:00Z'),
		userId: 'user004',
		template: 'templateA',
		metadata: JSON.stringify({ tags: ['engineer', 'mechanical'] }),
	},
	{
		id: '005',
		rawContent: 'Raw content for resume 005',
		formattedContent: 'Formatted content for resume 005',
		version: 1,
		status: 'under review',
		createdAt: new Date('2023-11-05T12:15:00Z'),
		updatedAt: new Date('2023-12-05T12:45:00Z'),
		userId: 'user005',
		template: 'templateD',
		metadata: JSON.stringify({ tags: ['analyst', 'data'] }),
	},
];

// Helper function for inserting data
async function insertDummyData(dataSet: DummyData[]) {
	for (const data of dataSet) {
		try {
			await griddb.insertData({ data })
			console.log(`Inserted data for ID: ${data.id}`)
		} catch (error) {
			console.error(`Failed to insert data for ID: ${data.id}. Error: ${(error as Error).message}`)
		}
	}
}

// Helper function for searching data
async function searchResumes() {
	try {
		const results = await griddb.searchData([
			{ type: 'sql-select', stmt: 'SELECT * FROM resumes' },
		])
		console.log('Search Results:', results)
	} catch (error) {
		console.error('Error searching data:', (error as Error).message)
	}
}

// Main logic
(async () => {
	try {
		await griddb.createContainer()
		console.log('Container created successfully.')
	} catch (error) {
		console.error('Error creating container:', (error as Error).message)
		return
	}

	await insertDummyData(dummyDataSet)
	await searchResumes()
})()


