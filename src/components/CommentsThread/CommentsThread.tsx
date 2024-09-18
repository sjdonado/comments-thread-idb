import React, { useState, useEffect } from 'react';
import type { Comment } from './store';
import Store from './store';

const CommentsThread: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);

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
      const newComment = await Store.addComment(text, replyToId);
      setComments([newComment, ...comments]);
      setText('');
      setReplyToId(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDeleteComment = async (id: number) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this comment?');

    if (!isConfirmed) return;

    const deleteRecursively = async (commentId: number) => {
      const childComments = comments.filter(c => c.parentId === commentId);
      for (const child of childComments) {
        await deleteRecursively(child.id);
      }
      await Store.deleteComment(commentId);
    };

    try {
      await deleteRecursively(id);
      const updatedComments = comments.filter(c => c.id !== id && c.parentId !== id);
      setComments(updatedComments);
    } catch (e) {
      alert('Failed to delete comment');
      console.error(e);
    }
  };

  const renderComments = (parentId: number | null, depth = 0) => {
    const filteredComments = comments.filter(c => c.parentId === parentId);

    return (
      <ul className="[&>li]:pt-4">
        {filteredComments.map(comment => (
          <li key={comment.id} style={{ marginLeft: `${depth * 20}px` }}>
            <div className="border-b pb-2">
              <span>{comment.text}</span>
              <div className="flex space-x-2 mt-1">
                <button onClick={() => setReplyToId(comment.id)} className="text-blue-500 hover:text-blue-700">
                  Reply
                </button>
                <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:text-red-700">
                  Delete
                </button>
              </div>
            </div>
            {renderComments(comment.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  const getReplyingToHint = () => {
    if (!replyToId) return '';

    const comment = comments.find(c => c.id === replyToId);
    return comment ? `Replying to: "${comment.text}"` : '';
  };

  return (
    <div className="flex flex-col mt-10 gap-4">
      {replyToId && (
        <div className="p-2 bg-gray-200 rounded-md">
          {getReplyingToHint()}
          <button onClick={() => setReplyToId(null)} className="ml-2 text-red-500 hover:text-red-700">
            Cancel
          </button>
        </div>
      )}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
        placeholder="Enter your comment"
      />
      <button onClick={handleAddComment} className="mt-2 bg-blue-600 text-white py-1 px-4 rounded-lg">
        Submit
      </button>
      {renderComments(null)}
    </div>
  );
};

export default CommentsThread;
