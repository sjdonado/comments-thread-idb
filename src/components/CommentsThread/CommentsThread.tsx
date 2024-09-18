import React, { useState } from 'react';

import type { Comment } from './store';
import Store from './store';

const CommentsThread: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');

  const handleAddComment = async () => {
    try {
      const newComment = await Store.insert(text);
      setComments([newComment, ...comments]);

      setText('');
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={4} cols={50} />
      <br />
      <button onClick={handleAddComment}>Add Comment</button>
      <h3>Comments</h3>
      <ul>
        {comments.map(comment => (
          <li key={comment.id}>{comment.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default CommentsThread;
