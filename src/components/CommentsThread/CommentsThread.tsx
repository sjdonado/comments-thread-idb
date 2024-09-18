import React, { useState, useEffect } from 'react';
import type { Comment } from './store';
import Store from './store';

const CommentsThread: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const loadComments = async () => {
      try {
        const loadedComments = await Store.getAllComments();
        setComments(loadedComments);
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    };

    loadComments();
  }, []);

  const handleAddComment = async () => {
    try {
      const newComment = await Store.addComment(text);
      setComments([newComment, ...comments]);
      setText('');
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDeleteComment = async (id: number) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this comment?');

    if (!isConfirmed) return;

    try {
      await Store.deleteComment(id);
      setComments(comments.filter(comment => comment.id !== id));
    } catch (e) {
      alert('Failed to delete comment');
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col mt-10 gap-4">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
        placeholder="Enter your comment"
      />
      <button onClick={handleAddComment} className="mt-2 bg-blue-600 text-white py-1 px-4 rounded-lg">
        Add Comment
      </button>
      <ul className="space-y-4">
        {comments.map(comment => (
          <li key={comment.id} className="border-b pb-2 flex justify-between items-center">
            <span>{comment.text}</span>
            <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:text-red-700">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentsThread;
