import { z } from 'zod';

const DATABASE_NAME = 'comments-db';
const STORE_NAME = 'comments';

const commentSchema = z.object({
  id: z.number(),
  text: z.string().min(1, 'Comment cannot be empty'),
  parentId: z.number().nullable(),
});

export type Comment = z.infer<typeof commentSchema>;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function add(text: Comment['text'], parentId: Comment['parentId']): Promise<Comment> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    try {
      const comment = commentSchema.parse({ id: Date.now(), text, parentId });
      const request = store.add(comment);

      request.onsuccess = () => {
        resolve(comment);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (err) {
      if (err instanceof z.ZodError) {
        reject(err.errors[0].message);
      } else {
        reject(err);
      }
    }
  });
}

async function getAll(): Promise<Comment[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const comments = request.result as Comment[];
      comments.sort((a, b) => b.id - a.id);

      resolve(comments);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function remove(id: number): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export const Store = {
  openDatabase,
  add,
  getAll,
  remove,
};
