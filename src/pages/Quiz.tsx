import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import PromptModal from "../components/layout/PromptModal";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(localStorage.getItem("quizScore"));
  const [submitted, setSubmitted] = useState(localStorage.getItem("quizSubmitted") === "true");
  const [aiHelpUsed, setAiHelpUsed] = useState({}); // Tracks AI hints per question
  const [aiPromptsLeft, setAiPromptsLeft] = useState({});
  const [isPromptOpen, setPromptOpen] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null); // Track active question

  const username = localStorage.getItem("username");

  useEffect(() => {
    axios.get("http://localhost:3000/questions").then((res) => setQuestions(res.data));
  }, []);

  const selectAnswer = (questionIndex: number, option: string) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: option });
  };

  const getHint = async (questionIndex: number, question: string, userQuestion: string) => {
    if (aiHelpUsed[questionIndex]) {
      alert("AI help already used for this question!");
      return;
    }

    const totalQuestionsUsed = Object.keys(aiHelpUsed).length;
    if (totalQuestionsUsed >= 3) {
      alert("AI help used for max 3 questions!");
      return;
    }

    if ((aiPromptsLeft[questionIndex] || 3) === 0) {
      alert("No more AI prompts left for this question!");
      return;
    }

    if (!userQuestion) return;

    try {
      const response = await axios.post("http://localhost:3000/ai-help", { username, question, userQuestion });
      alert(`Hint: ${response.data.hint}`);

      setAiHelpUsed({ ...aiHelpUsed, [questionIndex]: true });
      setAiPromptsLeft({ ...aiPromptsLeft, [questionIndex]: (aiPromptsLeft[questionIndex] || 3) - 1 });
    } catch (error) {
      alert("AI Help failed!");
    }
  };

  const submitQuiz = async () => {
    try {
      const response = await axios.post("http://localhost:3000/submit", { username, answers: selectedAnswers });
      setScore(response.data.score);
      setSubmitted(true);
      localStorage.setItem("quizSubmitted", "true");
      localStorage.setItem("quizScore", response.data.score);
      alert(`Your score: ${response.data.score}`);
    } catch (error) {
      alert("Submission failed!");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Quiz</h2>
      {questions.map((q, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow mb-4">
          <p className="text-lg font-semibold text-gray-700 mb-2">{q[" Question"]}</p>
          <div className="space-y-2">
            {["OptionA", "OptionB", "OptionC", "OptionD"].map((opt) => (
              <label
                key={opt}
                className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-blue-50"
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={q[opt]}
                  checked={selectedAnswers[index] === q[opt]}
                  onChange={() => selectAnswer(index, q[opt])}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-gray-700">{q[opt]}</span>
              </label>
            ))}
          </div>
          <Button className="mt-5" onClick={() => { setActiveQuestionIndex(index); setPromptOpen(true); }}>Ask for Hint</Button>
        </div>
      ))}

      {/* Prompt Modal with Correct Question */}
      {isPromptOpen && activeQuestionIndex !== null && (
        <PromptModal
          isOpen={isPromptOpen}
          onClose={() => { setPromptOpen(false); setActiveQuestionIndex(null); }}
          onSubmit={(userQuestion: string) => {
            console.log("Question is:", questions[activeQuestionIndex][" Question"]);
            getHint(activeQuestionIndex, questions[activeQuestionIndex][" Question"], userQuestion);
            setPromptOpen(false);
            setActiveQuestionIndex(null);
          }}
        />
      )}

      {!submitted ? (
        <button className="bg-blue-600 text-white p-2 mt-4" onClick={submitQuiz}>
          Submit
        </button>
      ) : (
        <p className="mt-4 text-lg">Your score: {score}</p>
      )}
    </div>
  );
};

export default Quiz;
