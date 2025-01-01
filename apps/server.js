import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { TeamResumeAgent, bioDefault } from "./team.kban.js";
import { createGridDBClient } from './lib/griddb-client.js';
import { generateRandomID } from "./lib/randomId.js";

const app = express();
const port = process.env.VITE_PORT || 3000;

const url = new URL(process.env.VITE_APP_BASE_URL);
const localhost = url.hostname;
const host = localhost || 'localhost';

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(express.static('public'));
app.use(express.static('dist'));

const dbConfig = {
	griddbWebApiUrl: process.env.GRIDDB_WEBAPI_URL,
	username: process.env.GRIDDB_USERNAME,
	password: process.env.GRIDDB_PASSWORD,
}

const dbClient = createGridDBClient(dbConfig);
dbClient.createContainer();

async function generateResume(aboutMe) {
	if (!aboutMe) {
		aboutMe = bioDefault;
	}

	try {
		const output = await TeamResumeAgent.start({ aboutMe });

		if (output.status === 'FINISHED') {
			return {
				status: 'success',
				result: output.result,
				stats: {
					duration: output.stats.duration,
					tokenCount: output.stats.llmUsageStats.inputTokens + output.stats.llmUsageStats.outputTokens,
					totalCost: output.stats.costDetails.totalCost
				}
			};
		} else if (output.status === 'BLOCKED') {
			return {
				status: 'error',
				error: 'Workflow is blocked, unable to complete',
				stats: null
			};
		}
	} catch (error) {
		return {
			status: 'error',
			error: error.message || 'Error generating resume',
			stats: null
		};
	}
}

app.post('/api/resumes', async (req, res) => {
	try {
		const resumeData = req.body || {};

		console.log(resumeData);
		const result = await generateResume(resumeData.content || undefined);
		console.log(result);

		const resume = {
			id: generateRandomID(),
			rawContent: resumeData.content,
			formattedContent: result.result,
			status: result.status,
			createdAt: new Date().toISOString(),
			information: JSON.stringify(result.stats),
		}

		// Save resume to database
		const dbResponse = await dbClient.insertData({ data: resume });

		console.log(dbResponse);

		if (result.status === 'success') {
			const all = {
				message: 'Resume created successfully',
				data: result.result,
				stats: result.stats,
				dbStatus: dbResponse
			}
			res.status(201).json(all);
		} else {
			res.status(400).json({
				message: 'Failed to generate resume',
				error: result.error
			});
		}
	} catch (error) {
		res.status(500).json({
			error: 'Server error while creating resume',
			details: error.message
		});
	}
});

app.get('/api/resumes', async (req, res) => {
	try {
		// Search all data
		const results = await dbClient.searchData([
			{ type: 'sql-select', stmt: 'SELECT * FROM resumes' }
		]);

		res.json({ data: results });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get('/api/resumes/:id', async (req, res) => {
	try {
		const { id } = req.params;
		// SQL to search data by id
		const results = await dbClient.searchData([
			{ type: 'sql-select', stmt: `SELECT * FROM resumes WHERE id=${id}` }
		]);

		res.json({ data: results });
	} catch (error) {
		res.status(500).json({ error: `Failed to fetch resume with id ${id}` });
	}
});

app.delete('/api/resumes/:id', async (req, res) => {
	try {
		const { id } = req.params;

		const results = await dbClient.searchData([
			{ type: 'sql-select', stmt: `DELETE FROM resumes WHERE id=${id}` }
		]);

		res.json({ message: `Resume ${id} deleted` });
	} catch (error) {
		res.status(500).json({ error: `Failed to delete resume with id ${id}` });
	}
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, host, () => {
	console.log(`Server running on port ${port}`);
});
