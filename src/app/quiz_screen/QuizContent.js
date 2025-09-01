'use client'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebaseConfig";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

const passThreshold = 80;

const flattenQuestions = (sections) => {
    if (!sections) return [];
    return sections.flatMap(section => section.questions);
};

export default function QuizScreen() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                
                // Fetch user role
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserRole(userDocSnap.data().role || 'Server');
                } else {
                    setUserRole('Server');
                }
            } else {
                setUser(null);
                router.push('/login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        const quizId = searchParams.get('quiz');
        if (quizId) {
            setSelectedQuiz(quizId);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!selectedQuiz || !userRole) return;

        const fetchQuizData = async () => {
            try {
                // Choose collection based on role
                const collectionName = userRole === 'Bartender' ? 'Bartender Training Quizes' : 'Server Training';
                const docRef = doc(db, collectionName, `quiz${selectedQuiz}`);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setQuizData(data);
                    setQuestions(flattenQuestions(data.sections));
                } else {
                    console.log(`No such document found for quiz${selectedQuiz} in ${collectionName}!`);
                }
            } catch (error) {
                console.error("Error fetching quiz data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizData();
    }, [selectedQuiz, userRole]);

    const currentQ = questions[currentQuestion];

    const handleAnswerSelect = (questionId, answerIndex) => {
        if (showAnswer) return;

        setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
        setShowAnswer(true);

        if (currentQuestion < questions.length - 1) {
            setTimeout(() => {
                setCurrentQuestion(prev => prev + 1);
                setShowAnswer(false);
            }, 1500);
        }
    };

    const calculateScore = () => {
        if (!questions.length) return 0;
        const correct = questions.filter(q => selectedAnswers[q.id] === q.correctAnswerIndex).length;
        return Math.round((correct / questions.length) * 100);
    };

    const handleQuizSubmit = async () => {
        const calculatedScore = calculateScore();
        setScore(calculatedScore);
        const passed = calculatedScore >= passThreshold;

        if (passed && user) {
            const userDocRef = doc(db, 'users', user.uid);
            
            // Save based on role
            const fieldName = userRole === 'Bartender' ? 
                `bartender_quiz_${selectedQuiz}_passed` : 
                `quiz_${selectedQuiz}_passed`;
                
            await updateDoc(userDocRef, {
                [fieldName]: true,
            });
        }
    };

    const handleRetry = () => {
        setScore(null);
        setSelectedAnswers({});
        setCurrentQuestion(0);
        setShowAnswer(false);
    };

    const getBackButtonRoute = () => {
        return userRole === 'Bartender' ? '/bartender_training' : '/server_training';
    };
    
    // --- Render Logic ---

    if (loading || !selectedQuiz) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-600">
                <p className="text-white text-xl">Loading quiz...</p>
            </div>
        );
    }
    
    // Result Screen
    if (score !== null) {
        const passed = score >= passThreshold;
        const correctCount = questions.filter(q =>
            selectedAnswers[q.id] === q.correctAnswerIndex
        ).length;

        return (
            <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-green-100 to-green-600 flex items-center justify-center font-inter">
                <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className={`p-8 text-center ${passed ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                        <h1 className="text-3xl font-bold mb-4">
                            {passed ? '🎉 Quiz Completed! 🎉' : '📝 Quiz Results'}
                        </h1>
                        <div className="flex justify-center items-center space-x-8">
                            <div className={`text-6xl font-bold ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {score}%
                            </div>
                            <div className="text-left">
                                <div className="text-lg font-medium text-gray-700">
                                    {correctCount} out of {questions.length} correct
                                </div>
                                <div className="text-gray-600">
                                    Pass threshold: {passThreshold}%
                                </div>
                                {passed ? (
                                    <div className="mt-2 text-emerald-600 font-medium">
                                        You passed the quiz!
                                    </div>
                                ) : (
                                    <div className="mt-2 text-rose-600 font-medium">
                                        Review and try again
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Question Breakdown</h2>
                        <div className="space-y-4">
                            {questions.map((q, idx) => {
                                const isCorrect = selectedAnswers[q.id] === q.correctAnswerIndex;
                                return (
                                    <div key={q.id} className={`p-5 rounded-xl border-2 ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                                        <div className="flex items-start">
                                            {isCorrect ? (
                                                <CheckCircle2 className="text-emerald-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                            ) : (
                                                <XCircle className="text-rose-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-800">{q.text}</p>
                                                <p className={`mt-2 ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    {isCorrect ? (
                                                        <span className="flex items-center">
                                                            <CheckCircle2 className="mr-1 inline" size={16} />
                                                            You answered correctly
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            <span className="font-medium">Correct answer:</span> {q.answers[q.correctAnswerIndex]}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
                        {passed ? (
                            <button
                                onClick={() => router.replace(getBackButtonRoute())}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg w-full md:w-auto"
                            >
                                Back to {userRole} Training
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleRetry}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg w-full md:w-auto"
                                >
                                    Try Again
                                </button>
                               
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    
    // Quiz Start Screen
    if (!quizStarted) {
        return (
            <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-green-100 to-green-600 flex items-center justify-center font-inter">
                <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 text-white text-center" style={{ background: 'linear-gradient(135deg, #49a078, #a2cc8e)' }}>
                        <h1 className="text-3xl font-bold mb-2">{userRole} Training Quiz {selectedQuiz}</h1>
                        <p className="text-green-100">Test your knowledge with this interactive quiz</p>
                    </div>
                    <div className="p-8">
                        <div className="bg-green-50 p-6 rounded-xl mb-8">
                            <h3 className="text-xl font-semibold text-green-800 mb-3">Quiz Overview:</h3>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start">
                                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                                        <ChevronRight className="text-green-600" size={14} />
                                    </div>
                                    <span>{questions.length} carefully crafted questions</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                                        <ChevronRight className="text-green-600" size={14} />
                                    </div>
                                    <span>Instant feedback on each answer</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                                        <ChevronRight className="text-green-600" size={14} />
                                    </div>
                                    <span>Passing score: {passThreshold}%</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                                        <ChevronRight className="text-green-600" size={14} />
                                    </div>
                                    <span>Detailed results at completion</span>
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={() => setQuizStarted(true)}
                            className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl transition-all shadow-md"
                        >
                            Start Quiz Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Question Screen
    return (
        <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-green-100 to-green-600 flex items-center justify-center font-inter">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Progress Bar */}
                <div className="h-2 bg-gray-200">
                    <div
                        className="h-full bg-green-600 transition-all duration-500"
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            Question {currentQuestion + 1} of {questions.length}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                            {quizData.sections.find(s => s.questions.some(q => q.id === currentQ?.id))?.name}
                        </div>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-800 mb-8">{currentQ?.text}</h2>

                    <div className="space-y-4">
                        {currentQ?.answers.map((answer, index) => {
                            let isSelected = selectedAnswers[currentQ.id] === index;
                            let isCorrect = index === currentQ.correctAnswerIndex;

                            let buttonClass = "w-full text-left p-5 rounded-xl border-2 text-lg transition-all";

                            if (showAnswer) {
                                if (isCorrect) {
                                    buttonClass += " bg-emerald-50 border-emerald-300 text-emerald-800";
                                } else if (isSelected) {
                                    buttonClass += " bg-rose-50 border-rose-300 text-rose-800";
                                } else {
                                    buttonClass += " bg-gray-50 border-gray-200 text-gray-700";
                                }
                            } else {
                                buttonClass += isSelected
                                    ? " bg-green-50 border-green-300 text-green-800"
                                    : " bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(currentQ.id, index)}
                                    className={buttonClass}
                                    disabled={showAnswer}
                                >
                                    <div className="flex items-center">
                                        {showAnswer && (
                                            <span className="mr-3">
                                                {isCorrect ? (
                                                    <CheckCircle2 className="text-emerald-500" size={20} />
                                                ) : isSelected ? (
                                                    <XCircle className="text-rose-500" size={20} />
                                                ) : null}
                                            </span>
                                        )}
                                        <span>{answer}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {currentQuestion === questions.length - 1 && (
                        <div className="mt-10 flex justify-center">
                            <button
                                onClick={handleQuizSubmit}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all text-lg shadow-lg"
                            >
                                Submit Quiz
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}