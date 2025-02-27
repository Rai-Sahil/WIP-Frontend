import { useState } from "react";

interface PromptModalProps {
    isOpen: boolean,
    onClose: () => void,
    onSubmit: (question: string) => void
}

const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [input, setInput] = useState("");

    if (!isOpen) return;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-black rounded-2xl p-6 shadow-xl w-[90%] max-w-md">
                <h2 className="text-xl font-semibold text-black dark:text-white">Ask a Question</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Enter your question about this quiz question.
                </p>
                <input
                type="text"
                className="w-full mt-4 p-3 border rounded-xl text-black dark:text-white bg-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                        onClick={onClose}
                    >
                    Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        onClick={() => onSubmit(input)}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PromptModal;