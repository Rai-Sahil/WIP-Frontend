import React from "react";

interface ScoreModalProps {
  score: number;
  onClose: () => void;
}

const ScoreModal: React.FC<ScoreModalProps> = ({ score, onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-96 text-center">
        <h4 className="text-xl font-bold text-gray-700 mb-4">Quiz Completed!</h4>
        <p className="text-lg text-gray-700">Your Score: {score}</p>
        <button
          onClick={onClose}
          className="mt-6 bg-blue-600 text-white py-2 px-5 rounded-full text-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ScoreModal;
