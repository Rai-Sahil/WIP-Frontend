import React from "react";

interface HintPopoverProps {
  message: string;
  onClose: () => void;
}

const HintPopover: React.FC<HintPopoverProps> = ({ message, onClose }) => {
  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 max-w-xs z-50">
      <div className="text-lg font-semibold">Hint</div>
      <div className="mt-2 text-sm text-gray-600">{message}</div>
      <button
        onClick={onClose}
        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  );
};

export default HintPopover;
