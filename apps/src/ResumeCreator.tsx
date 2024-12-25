import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ResumeCreator = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
	const [resumeText, setResumeText] = useState(
		"My name is Alex Navarro.\nGo Developer for 6 years.\n" +
		"I worked for four years at Stripe, where I built scalable back-end microservices for their payment processing platform, " +
		"focusing on distributed systems and API development using Go. Before Stripe, I was a Back-End Engineer at DigitalOcean, " +
		"where I developed internal tools and improved the performance of customer-facing APIs.\n\n" +
		"Portfolio:\n" +
		"1. Real-Time Event Streaming Platform - Developed a real-time event streaming service using Kafka and Go, processing millions of events daily.\n" +
		"2. Cloud Cost Optimization Tool - Built a Go-based CLI for analyzing and reducing cloud infrastructure costs.\n" +
		"3. E-commerce Platform API - Designed and implemented RESTful APIs for a high-traffic online marketplace with Go and PostgreSQL.\n" +
		"4. Load Balancer for Microservices - Created a custom lightweight load balancer with Go to manage high-availability and request distribution.\n" +
		"5. CI/CD Pipeline Optimizer - Automated CI/CD workflows with Go-based scripts, reducing deployment times by 40%.\n\n" +
		"I earned a Bachelor of Science in Computer Science from UC Berkeley in 2017 and have been actively contributing to the open-source Go community."
	);


	const BASE_URL = import.meta.env.VITE_API_URL;
	console.log(`Base URL:`, BASE_URL)

	const handleSubmit = async () => {
		setIsSubmitting(true);
		setSubmitStatus(null);

		try {
			const response = await fetch(`${BASE_URL}/api/resumes`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ content: resumeText })
			});

			if (!response.ok) {
				throw new Error('Failed to create resume');
			}

			await response.json();
			setSubmitStatus('success');

		} catch (error) {
			console.error('Error creating resume:', error);
			setSubmitStatus('error');
		} finally {
			setIsSubmitting(false);
			setTimeout(() => setSubmitStatus(null), 5000);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-8 space-y-6">
			<h1 className="text-3xl font-bold text-center">
				Resume Creator
				<div className="w-40 h-1 bg-green-500 mx-auto mt-1"></div>
			</h1>

			{submitStatus && (
				<Alert className={submitStatus === 'success' ? 'bg-green-50' : 'bg-red-50'}>
					<AlertDescription>
						{submitStatus === 'success'
							? 'Resume created successfully!'
							: 'Failed to create resume. Please try again.'}
					</AlertDescription>
				</Alert>
			)}

			<div className="space-y-6">
				<h2 className="text-2xl font-semibold">About Me</h2>

				<Card className="border-2">
					<CardContent className="p-6">
						<p className="text-sm text-gray-600 mb-4">
							Enter your professional experience, skills, and education. Our AI will help format this into a polished resume.
						</p>
						<Textarea
							value={resumeText}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResumeText(e.target.value)}
							className="min-h-[400px] font-mono"
							placeholder="Enter your resume content here..."
						/>
					</CardContent>
				</Card>

				<div className="flex justify-center">
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting}
						className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md"
					>
						{isSubmitting ? 'Creating...' : 'Create Resume'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ResumeCreator;