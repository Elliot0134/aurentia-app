import React, { useState } from 'react';
import { Plus, X, GripVertical, HelpCircle, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { QuizBlock as QuizBlockType } from '@/types/resourceTypes';

interface QuizBlockProps {
  block: QuizBlockType;
  onUpdate: (data: Partial<QuizBlockType['data']>) => void;
  readOnly?: boolean;
  isActive?: boolean;
}

export function QuizBlock({ block, onUpdate, readOnly = false, isActive = false }: QuizBlockProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [showResults, setShowResults] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const questions = block.data.questions || [];

  // Calculate score
  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] !== undefined) {
        const userAnswer = userAnswers[q.id];
        if (String(userAnswer) === String(q.correctAnswer)) {
          correct++;
        }
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: questions.length > 0 ? (correct / questions.length) * 100 : 0
    };
  };

  // Add question
  const handleAddQuestion = (type: 'multiple_choice' | 'true_false' | 'short_answer' = 'multiple_choice') => {
    const newQuestion = {
      id: `q${Date.now()}`,
      question: 'Nouvelle question',
      type,
      options: type === 'multiple_choice' ? ['Option A', 'Option B', 'Option C'] :
               type === 'true_false' ? ['Vrai', 'Faux'] : undefined,
      correctAnswer: type === 'multiple_choice' ? 0 :
                     type === 'true_false' ? 0 : '',
      points: 1
    };
    onUpdate({ questions: [...questions, newQuestion] });
  };

  // Delete question
  const handleDeleteQuestion = (questionId: string) => {
    onUpdate({ questions: questions.filter(q => q.id !== questionId) });
  };

  // Update question
  const handleUpdateQuestion = (questionId: string, updates: any) => {
    onUpdate({
      questions: questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    });
  };

  // Add option to question
  const handleAddOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.options) return;

    handleUpdateQuestion(questionId, {
      options: [...question.options, `Option ${question.options.length + 1}`]
    });
  };

  // Delete option
  const handleDeleteOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.options || question.options.length <= 2) return;

    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    const newCorrectAnswer = question.correctAnswer === optionIndex ? 0 :
                            question.correctAnswer > optionIndex ? question.correctAnswer - 1 : question.correctAnswer;

    handleUpdateQuestion(questionId, {
      options: newOptions,
      correctAnswer: newCorrectAnswer
    });
  };

  // Update option text
  const handleUpdateOption = (questionId: string, optionIndex: number, text: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.options) return;

    const newOptions = question.options.map((opt, i) => i === optionIndex ? text : opt);
    handleUpdateQuestion(questionId, { options: newOptions });
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
  };

  // READONLY MODE - Interactive Quiz
  if (readOnly) {
    const score = calculateScore();
    const requirePassingScore = block.data.requirePassingScore ?? true;
    const passed = requirePassingScore ? score.percentage >= (block.data.passingScore || 70) : true;

    return (
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader className="bg-blue-50 border-b">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">{block.data.title || 'Quiz'}</CardTitle>
          </div>
          {block.data.description && (
            <p className="text-sm text-gray-600 mt-2">{block.data.description}</p>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {!showResults ? (
            <>
              {questions.map((q, index) => (
                <div key={q.id} className="p-4 bg-white rounded-lg border">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{q.question}</p>
                      {q.points && q.points > 1 && (
                        <span className="text-xs text-gray-500 mt-1">({q.points} points)</span>
                      )}
                    </div>
                  </div>

                  <div className="ml-9 space-y-2">
                    {q.type === 'multiple_choice' && q.options && (
                      <RadioGroup
                        value={String(userAnswers[q.id] ?? '')}
                        onValueChange={(value) => setUserAnswers(prev => ({ ...prev, [q.id]: parseInt(value) }))}
                      >
                        {q.options.map((option, optIdx) => (
                          <div key={optIdx} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                            <RadioGroupItem value={String(optIdx)} id={`${q.id}-${optIdx}`} />
                            <Label htmlFor={`${q.id}-${optIdx}`} className="flex-1 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {q.type === 'true_false' && (
                      <RadioGroup
                        value={String(userAnswers[q.id] ?? '')}
                        onValueChange={(value) => setUserAnswers(prev => ({ ...prev, [q.id]: parseInt(value) }))}
                      >
                        <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                          <RadioGroupItem value="0" id={`${q.id}-true`} />
                          <Label htmlFor={`${q.id}-true`} className="flex-1 cursor-pointer">Vrai</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                          <RadioGroupItem value="1" id={`${q.id}-false`} />
                          <Label htmlFor={`${q.id}-false`} className="flex-1 cursor-pointer">Faux</Label>
                        </div>
                      </RadioGroup>
                    )}

                    {q.type === 'short_answer' && (
                      <Input
                        placeholder="Votre réponse..."
                        value={String(userAnswers[q.id] ?? '')}
                        onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full"
                      />
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length !== questions.length}
                  style={{ backgroundColor: 'var(--color-primary, #ff5932)' }}
                  className="hover:opacity-90 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Soumettre le quiz
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Score Display */}
              <div className={cn(
                "p-6 rounded-lg text-center",
                requirePassingScore
                  ? (passed ? "bg-green-50 border-2 border-green-200" : "bg-orange-50 border-2 border-orange-200")
                  : "bg-blue-50 border-2 border-blue-200"
              )}>
                <Trophy className={cn(
                  "w-12 h-12 mx-auto mb-3",
                  requirePassingScore
                    ? (passed ? "text-green-600" : "text-orange-600")
                    : "text-blue-600"
                )} />
                <h3 className="text-2xl font-bold mb-2">
                  {score.correct} / {score.total} correct
                </h3>
                <p className="text-xl font-semibold mb-1">
                  Score: {Math.round(score.percentage)}%
                </p>
                {requirePassingScore && (
                  <p className={cn(
                    "text-sm font-medium",
                    passed ? "text-green-700" : "text-orange-700"
                  )}>
                    {passed ? '✅ Réussi!' : `❌ Échec (${block.data.passingScore}% requis)`}
                  </p>
                )}
                {!requirePassingScore && (
                  <p className="text-sm font-medium text-blue-700">
                    ✓ Quiz complété!
                  </p>
                )}
              </div>

              {/* Detailed Results */}
              <div className="space-y-3">
                {questions.map((q, index) => {
                  const userAnswer = userAnswers[q.id];
                  const isCorrect = String(userAnswer) === String(q.correctAnswer);

                  return (
                    <div key={q.id} className={cn(
                      "p-4 rounded-lg border-2",
                      isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    )}>
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{q.question}</p>
                          {q.type === 'multiple_choice' && q.options && (
                            <div className="mt-2 text-sm space-y-1">
                              <p className="text-gray-600">
                                Votre réponse: <span className={isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                                  {q.options[userAnswer as number]}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p className="text-green-700">
                                  Bonne réponse: <span className="font-medium">{q.options[q.correctAnswer as number]}</span>
                                </p>
                              )}
                            </div>
                          )}
                          {q.type === 'short_answer' && (
                            <div className="mt-2 text-sm space-y-1">
                              <p className="text-gray-600">
                                Votre réponse: <span className={isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                                  {userAnswer}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p className="text-green-700">
                                  Bonne réponse: <span className="font-medium">{q.correctAnswer}</span>
                                </p>
                              )}
                            </div>
                          )}
                          {q.explanation && (
                            <p className="mt-2 text-sm text-gray-700 italic">
                              💡 {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleResetQuiz}
                  variant="outline"
                >
                  Recommencer le quiz
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // EDIT MODE - Quiz Builder
  return (
    <Card className={cn(
      "border-2 transition-all",
      isActive ? "border-blue-400 bg-blue-50/30" : "border-gray-200"
    )}>
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-600">Quiz Interactif</span>
        </div>
        <div className="space-y-2 mt-3">
          <Input
            value={block.data.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Titre du quiz..."
            className="font-semibold"
          />
          <Textarea
            value={block.data.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Description (optionnelle)..."
            rows={2}
            className="text-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Questions */}
        {questions.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Aucune question</p>
            <Button
              onClick={() => handleAddQuestion('multiple_choice')}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une question
            </Button>
          </div>
        ) : (
          questions.map((q, index) => (
            <div
              key={q.id}
              className="group p-4 border-2 rounded-lg bg-white hover:border-blue-200 transition-colors"
            >
              {/* Question Header */}
              <div className="flex items-start gap-2 mb-3">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-1" />
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={q.question}
                    onChange={(e) => handleUpdateQuestion(q.id, { question: e.target.value })}
                    placeholder="Question..."
                    className="font-medium resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Select
                      value={q.type}
                      onValueChange={(value: any) => {
                        const updates: any = { type: value };
                        if (value === 'true_false') {
                          updates.options = ['Vrai', 'Faux'];
                          updates.correctAnswer = 0;
                        } else if (value === 'short_answer') {
                          updates.options = undefined;
                          updates.correctAnswer = '';
                        } else if (value === 'multiple_choice' && !q.options) {
                          updates.options = ['Option A', 'Option B', 'Option C'];
                          updates.correctAnswer = 0;
                        }
                        handleUpdateQuestion(q.id, updates);
                      }}
                    >
                      <SelectTrigger className="w-40 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Choix multiples</SelectItem>
                        <SelectItem value="true_false">Vrai/Faux</SelectItem>
                        <SelectItem value="short_answer">Réponse courte</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={q.points || 1}
                      onChange={(e) => handleUpdateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                      placeholder="Points"
                      className="w-20 h-8 text-xs"
                      min={1}
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>

              {/* Options/Answer */}
              <div className="ml-12 space-y-2">
                {q.type === 'multiple_choice' && q.options && (
                  <>
                    {q.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2 group/option">
                        <RadioGroup
                          value={String(q.correctAnswer)}
                          onValueChange={(value) => handleUpdateQuestion(q.id, { correctAnswer: parseInt(value) })}
                        >
                          <RadioGroupItem value={String(optIdx)} id={`correct-${q.id}-${optIdx}`} />
                        </RadioGroup>
                        <Input
                          value={option}
                          onChange={(e) => handleUpdateOption(q.id, optIdx, e.target.value)}
                          placeholder={`Option ${optIdx + 1}...`}
                          className="flex-1 h-8 text-sm"
                        />
                        {q.options && q.options.length > 2 && (
                          <button
                            onClick={() => handleDeleteOption(q.id, optIdx)}
                            className="p-1 hover:bg-red-100 rounded opacity-0 group-hover/option:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-red-600" />
                          </button>
                        )}
                      </div>
                    ))}
                    <Button
                      onClick={() => handleAddOption(q.id)}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Ajouter une option
                    </Button>
                  </>
                )}

                {q.type === 'true_false' && (
                  <RadioGroup
                    value={String(q.correctAnswer)}
                    onValueChange={(value) => handleUpdateQuestion(q.id, { correctAnswer: parseInt(value) })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id={`correct-${q.id}-true`} />
                      <Label htmlFor={`correct-${q.id}-true`}>Vrai</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id={`correct-${q.id}-false`} />
                      <Label htmlFor={`correct-${q.id}-false`}>Faux</Label>
                    </div>
                  </RadioGroup>
                )}

                {q.type === 'short_answer' && (
                  <div>
                    <Label className="text-xs text-gray-600 mb-1">Bonne réponse:</Label>
                    <Input
                      value={String(q.correctAnswer)}
                      onChange={(e) => handleUpdateQuestion(q.id, { correctAnswer: e.target.value })}
                      placeholder="Réponse attendue..."
                      className="h-8 text-sm"
                    />
                  </div>
                )}

                {/* Explanation */}
                <div className="mt-2">
                  <Input
                    value={q.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                    placeholder="💡 Explication (optionnelle)..."
                    className="h-8 text-xs italic"
                  />
                </div>
              </div>
            </div>
          ))
        )}

        {/* Add Question Buttons */}
        {questions.length > 0 && (
          <div className="flex gap-2 justify-center pt-2">
            <Button
              onClick={() => handleAddQuestion('multiple_choice')}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Choix multiples
            </Button>
            <Button
              onClick={() => handleAddQuestion('true_false')}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Vrai/Faux
            </Button>
            <Button
              onClick={() => handleAddQuestion('short_answer')}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Réponse courte
            </Button>
          </div>
        )}

        {/* Quiz Settings */}
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-3">Paramètres</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Switch
                  id="require-passing-score"
                  checked={block.data.requirePassingScore ?? true}
                  onCheckedChange={(checked) => onUpdate({ requirePassingScore: checked })}
                />
                <Label htmlFor="require-passing-score" className="text-sm font-medium cursor-pointer">
                  Exiger un score de passage
                </Label>
              </div>
            </div>
            {(block.data.requirePassingScore ?? true) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Score de passage (%)</Label>
                  <Input
                    type="number"
                    value={block.data.passingScore || 70}
                    onChange={(e) => onUpdate({ passingScore: parseInt(e.target.value) || 70 })}
                    className="h-8 text-sm mt-1"
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 Sélectionnez la réponse correcte avec le bouton radio • Glissez pour réorganiser les questions
        </div>
      </CardContent>
    </Card>
  );
}

export default QuizBlock;
