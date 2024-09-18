import CommentsThread from './components/CommentsThread/CommentsThread';

export default function App() {
  return (
    <div className="flex flex-col mx-auto max-w-screen-lg gap-6">
      <h1 className="text-xl text-center mt-6">Comments Thread</h1>
      <CommentsThread />
    </div>
  );
}
