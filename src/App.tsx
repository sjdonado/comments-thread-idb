import CommentsThread from './components/CommentsThread/CommentsThread';

export default function App() {
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-xl">Comments</h1>
      <CommentsThread />
    </div>
  );
}
