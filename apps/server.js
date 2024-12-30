import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { TeamResumeAgent, bioDefault } from "./team.kban.js";

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
		if (result.status === 'success') {
			const all = {
				message: 'Resume created successfully',
				data: result.result,
				stats: result.stats
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

// Routes
// Get all resumes
app.get('/api/resumes', async (req, res) => {
	try {
		// TODO: Implement database query to fetch all resumes
		res.json({ message: 'Get all resumes' });
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch resumes' });
	}
});

// Get single resume
app.get('/api/resumes/:id', async (req, res) => {
	try {
		const { id } = req.params;
		// TODO: Implement database query to fetch specific resume
		res.json({ message: `Get resume ${id}` });
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch resume' });
	}
});

// Create new resume
app.post('/api/resumes', async (req, res) => {
	try {
		// code here
		const resumeData = req.body;

		// TODO: Implement database storage
		res.status(201).json({ message: 'Resume created', data: resumeData });
	} catch (error) {
		res.status(500).json({ error: 'Failed to create resume' });
	}
});

// Delete resume
app.delete('/api/resumes/:id', async (req, res) => {
	try {
		const { id } = req.params;
		// TODO: Implement database deletion
		res.json({ message: `Resume ${id} deleted` });
	} catch (error) {
		res.status(500).json({ error: 'Failed to delete resume' });
	}
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, host, () => {
	console.log(`Server running on port ${port}`);
});

