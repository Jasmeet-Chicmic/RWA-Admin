import CustomModal from "../CustomModal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  isLoading?: boolean;
}
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}: ConfirmationModalProps) => {
  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="p-0">
        <p className="text-labelprimary mb-4 dark:text-sidebartext">
          {message}
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="disabled:opacity-50 px-4 py-2 bg-gray-200 text-labelprimary rounded hover:bg-darklabelprimary dark:bg-darkbgprimary dark:text-sidebartext"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="disabled:opacity-50 px-4 py-2 bg-primarycolor text-bgwhite rounded hover:opacity-50"
            disabled={isLoading}
          >
            Confirm
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ConfirmationModal;
