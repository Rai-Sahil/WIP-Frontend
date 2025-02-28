import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import PromptModal from "../components/layout/PromptModal";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState<any>({});
  const [score, setScore] = useState(localStorage.getItem("quizScore"));
  const [submitted, setSubmitted] = useState(localStorage.getItem("quizSubmitted") === "true");
  const [isPromptOpen, setPromptOpen] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(3);
  const [aiHintsLeft, setAiHintsLeft] = useState<{ [key: number]: number }>({}); // Store hints left per question

  const username = localStorage.getItem("username");

  useEffect(() => {
    axios.get("https://wip-backend-three.vercel.app/questions")
      .then((res) => {
        const fetchedQuestions = res.data;
        setQuestions(fetchedQuestions);
      })
      .catch((error) => console.error("Error fetching questions:", error));

    // Fetch AI usage data to track hints used for each question
    if (username) {
      axios.get(`https://wip-backend-three.vercel.app/ai-usage/${username}`)
        .then((response) => {
          const data = response.data;
          const hintsUsage: any = {};

          data.forEach((question: any) => {
            hintsUsage[question.id] = question.hintsLeft;
          });
          setAiHintsLeft(hintsUsage);
          console.log(data);
        })
        .catch((error) => console.error("Error fetching AI usage:", error));
    }
  }, [username]);

  const selectAnswer = (questionIndex: number, option: string) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: option });
  };

  const getHint = async (question: string, userQuestion: string) => {
    if (!userQuestion) return;

    // Check if hints are available
    if (aiHintsLeft[activeQuestionIndex] <= 0) {
      alert("No hints left for this question.");
      return;
    }

    try {
      const response = await axios.post("https://wip-backend-three.vercel.app/ai-help", { username, question, userQuestion });
      alert(`Hint: ${response.data.hint}`);
      setAiHintsLeft((prev) => ({
        ...prev,
        [activeQuestionIndex]: aiHintsLeft[activeQuestionIndex] - 1,
      }));
    } catch (error) {
      alert("No AI Help Left");
    }
  };

  const submitQuiz = async () => {
    try {
      const response = await axios.post("https://wip-backend-three.vercel.app/submit", { username, answers: selectedAnswers });
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
    <div className="relative p-4">
      {/* Hint Counter */}
      <div className="absolute top-0 right-0 bg-black text-white rounded-full px-3 py-1 text-sm">
        Hints Left: {3 - Object.keys(aiHintsLeft).length || 3}
      </div>

      <h2 className="text-xl font-bold mb-2">Quiz</h2>
      {questions.map((q, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow mb-4">

          <p className="text-lg font-semibold text-gray-700 mb-2">{q["Question"]}</p>
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

      {isPromptOpen && activeQuestionIndex !== -1 && (
        <PromptModal
          isOpen={isPromptOpen}
          onClose={() => { setPromptOpen(false); setActiveQuestionIndex(-1); }}
          onSubmit={(userQuestion) => {
            getHint(questions[activeQuestionIndex]["Question"], userQuestion);
            setPromptOpen(false);
            setActiveQuestionIndex(-1);
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
