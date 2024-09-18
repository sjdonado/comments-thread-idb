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
          <li key={comment.id} className="border-b pb-2">
            {comment.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentsThread;
