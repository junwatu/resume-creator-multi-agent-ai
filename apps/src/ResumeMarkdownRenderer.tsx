import { ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResumeMarkdownRendererProps {
	markdown: string;
}

export const ResumeMarkdownRenderer: React.FC<ResumeMarkdownRendererProps> = ({ markdown }) => {

	const cleanMarkdown = markdown.replace(/\n\s*\+/g, '');

	return (
		<div className="max-w-4xl mx-auto p-8">
			<div className="mb-8">
				<a href="/" className="inline-flex items-center text-green-500 hover:text-green-600">
					<ChevronLeft className="w-5 h-5 mr-1" />
					Back to Resume Creator
				</a>
			</div>

			<div className="bg-white rounded-lg shadow-lg p-8 prose prose-slate max-w-none">
				<ReactMarkdown>{cleanMarkdown}</ReactMarkdown>
			</div>
		</div>
	);
};