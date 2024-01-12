export interface UploadButtonProps {
  onClick: () => void;
}

function UploadButton({ onClick }: UploadButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg">
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 17v2a2 2 0 0 1 2 2h2m8 0h2a2 2 0 0 1 2-2v-2m-4-5l-4-4m0 0l-4 4m4-4v12"></path>
      </svg>
    </button>
  );
}

export default UploadButton;
