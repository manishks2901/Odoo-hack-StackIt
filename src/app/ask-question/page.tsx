"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { TiptapEditor } from '@/components/TiptapEditor';

const AskQuestion = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (tags.length >= 5) {
                alert('Maximum 5 tags allowed');
                return;
            }
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        setIsLoading(true);
        
        try {
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    tags
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit question');
            }

            console.log('Question submitted successfully:', data);
            
            // Show success message
            alert('Question submitted successfully!');
            
            // Reset form
            setTitle('');
            setDescription('');
            setTags([]);
            
            // Redirect to home page
            router.push('/');
        } catch (error) {
            console.error('Error submitting question:', error);
            alert(error instanceof Error ? error.message : 'Failed to submit question. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
                    <p className="text-gray-600">
                        Share your knowledge and help others by asking a detailed question.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Question Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-medium">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter your question title..."
                                    className="w-full"
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    Be specific and imagine you&apos;re asking a question to another person.
                                </p>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium">
                                    Description
                                </Label>
                                <TiptapEditor
                                    content={description}
                                    onChange={setDescription}
                                    placeholder="Provide details about your question. Include what you've tried and what you're looking for..."
                                />
                                <p className="text-xs text-gray-500">
                                    Include all the information someone would need to answer your question.
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label htmlFor="tags" className="text-sm font-medium">
                                    Tags
                                </Label>
                                <div className="space-y-2">
                                    <Input
                                        id="tags"
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder="Press Enter to add tags..."
                                        className="w-full"
                                    />
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, index) => (
                                                <Badge key={index} variant="secondary" className="px-3 py-1">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-2 hover:bg-gray-300 rounded-full p-1"
                                                        aria-label={`Remove ${tag} tag`}
                                                        title={`Remove ${tag} tag`}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Add up to 5 tags to describe what your question is about.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !title.trim() || !description.trim()}
                                    className="px-8"
                                >
                                    {isLoading ? 'Submitting...' : 'Submit Question'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AskQuestion;