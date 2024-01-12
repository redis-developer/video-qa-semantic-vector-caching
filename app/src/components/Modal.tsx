export interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ show, onClose, children }: ModalProps) {
  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full"
      onClick={onClose}>
      <div
        className="relative top-20 mx-auto p-5 border w-full md:w-3/4 lg:w-1/2 xl:w-1/4 shadow-lg rounded-md bg-white"
        onClick={(e) => {
          e.stopPropagation();
        }}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
