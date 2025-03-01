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
  const [aiHintsLeft, setAiHintsLeft] = useState<any>({}); // Store hints left per question
  const [hint, setHint] = useState<string>("");

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
      setHint("No hints left for this question.");
      return;
    }

    try {
      const response = await axios.post("https://wip-backend-three.vercel.app/ai-help", { username, question, userQuestion });
      setHint(`Hint: ${response.data.hint}`);
      setAiHintsLeft((prev: any) => ({
        ...prev,
        [activeQuestionIndex]: Math.max((prev[activeQuestionIndex] || 1) - 1, 0),
      }));
    } catch (error) {
      setHint("No AI Help Left");
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

      setTimeout(() => {
        window.close()
      }, 5000)
    } catch (error) {
      alert("Submission failed!");
    }
  };

  return (
    <div className="relative p-4">
      {submitted ? (
        <h1>Your score: {score}</h1>
      ) : (
        <>
          <div className="absolute top-0 right-0 bg-black text-white rounded-full px-3 py-1 text-sm">
            Hints Left: {3 - Object.keys(aiHintsLeft).length}
          </div>

          <h2 className="text-xl font-bold mb-2">Quiz</h2>
          {questions.map((q, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow mb-4">
              {/* {Object.entries(aiHintsLeft).map(([question, hintsLeft]) => {
                if (question === q["Question"]) {
                  return (
                    <div key={index} className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
                      Prompt Left: {String(hintsLeft)}
                    </div>
                  );
                }
              })} */}

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

          <button className="bg-blue-600 text-white p-2 mt-4" onClick={submitQuiz}>
            Submit
          </button>

          {/* Hint Popover */}
          {hint && (
            <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
              <div className="bg-white p-8 rounded-lg shadow-2xl w-96 text-center">
                <h4 className="text-xl font-bold text-gray-700 mb-4">Hint</h4>
                <p className="text-lg text-gray-700">{hint}</p>
                <button
                  onClick={() => setHint('')}
                  className="mt-6 bg-blue-600 text-white py-2 px-5 rounded-full text-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;
