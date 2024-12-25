// src/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: './uploads/',
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 5000000 }, // 5MB limit
	fileFilter: (req, file, cb) => {
		const allowedTypes = ['image/jpeg', 'image/png'];
		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only JPEG and PNG allowed.'));
		}
	}
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Validation middleware for resume data
const validateResumeData = [
	body('personalInfo.name').notEmpty().trim().withMessage('Name is required'),
	body('personalInfo.email').isEmail().withMessage('Valid email is required'),
	body('personalInfo.phone').optional().matches(/^\+?[\d\s-]+$/).withMessage('Invalid phone number'),
	body('experience').isArray().withMessage('Experience must be an array'),
	body('education').isArray().withMessage('Education must be an array'),
	body('skills').isArray().withMessage('Skills must be an array')
];

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
app.post('/api/resumes', validateResumeData, async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const resumeData = req.body;
		// TODO: Implement database storage
		res.status(201).json({ message: 'Resume created', data: resumeData });
	} catch (error) {
		res.status(500).json({ error: 'Failed to create resume' });
	}
});

// Update resume
app.put('/api/resumes/:id', validateResumeData, async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { id } = req.params;
		const updateData = req.body;
		// TODO: Implement database update
		res.json({ message: `Resume ${id} updated`, data: updateData });
	} catch (error) {
		res.status(500).json({ error: 'Failed to update resume' });
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

// Upload profile picture
app.post('/api/upload/profile-picture', upload.single('profile'), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}
		res.json({
			message: 'File uploaded successfully',
			filename: req.file.filename,
			path: `/uploads/${req.file.filename}`
		});
	} catch (error) {
		res.status(500).json({ error: 'Failed to upload file' });
	}
});

// Generate PDF resume
app.post('/api/resumes/:id/generate-pdf', async (req, res) => {
	try {
		const { id } = req.params;
		// TODO: Implement PDF generation logic
		res.json({ message: `Generate PDF for resume ${id}` });
	} catch (error) {
		res.status(500).json({ error: 'Failed to generate PDF' });
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
