import React, { useState, useEffect, useRef } from 'react';
import type { Comment } from './store';
import { Store } from './store';

const CommentsThread: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const loadedComments = await Store.getAll();
        setComments(loadedComments);
      } catch (err) {
        console.error('Failed to load comments:', err);
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
    } catch (err) {
      alert((err as Error).message);
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
      await Store.remove(commentId);
    };

    try {
      await deleteRecursively(id);
      const updatedComments = comments.filter(c => c.id !== id && c.parentId !== id);
      setComments(updatedComments);
    } catch (err) {
      alert('Failed to delete comment');
      console.error(err);
    }
  };

  const handleReply = (id: number) => {
    setReplyToId(id);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const getReplyingToHint = () => {
    if (!replyToId) return '';

    const comment = comments.find(c => c.id === replyToId);
    return comment ? `Replying to: "${comment.text}"` : '';
  };

  const renderComments = (parentId: number | null, depth = 0) => {
    const filteredComments = comments.filter(c => c.parentId === parentId);

    return (
      <ul className="[&>li]:pt-4">
        {filteredComments.map(comment => (
          <li key={comment.id} style={{ marginLeft: `${depth * 20}px` }}>
            <div className="flex flex-col border-b pb-2 gap-1">
              <span>{comment.text}</span>
              <div className="flex space-x-2">
                <button className="text-blue-500 hover:text-blue-700" onClick={() => handleReply(comment.id)}>
                  Reply
                </button>
                <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteComment(comment.id)}>
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

  return (
    <div className="flex flex-col mt-10 gap-4">
      {replyToId && (
        <div className="p-2 bg-gray-200 rounded-md">
          {getReplyingToHint()}
          <button className="ml-2 text-red-500 hover:text-red-700" onClick={() => setReplyToId(null)}>
            Cancel
          </button>
        </div>
      )}
      <textarea
        ref={textareaRef}
        rows={4}
        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
        placeholder="Enter your comment"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
          }
        }}
      />
      <button className="mt-2 bg-blue-600 text-white py-1 px-4 rounded-lg" onClick={handleAddComment}>
        Submit
      </button>
      {renderComments(null)}
    </div>
  );
};

export default CommentsThread;
