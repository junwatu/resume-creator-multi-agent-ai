import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

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

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
