import React from 'react';
import { ListeningQuestion } from '../lib/listeningTestService';

interface QuestionRendererProps {
  question: ListeningQuestion;
  answer: string;
  onAnswerChange: (answer: string) => void;
  disabled?: boolean;
}

export default function QuestionRenderer({ question, answer, onAnswerChange, disabled = false }: QuestionRendererProps) {
  const renderFormCompletion = () => (
    <div className="space-y-2">
      <p className="text-gray-700 dark:text-gray-300">{question.questionText}</p>
      <input
        type="text"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        placeholder="Type your answer..."
      />
    </div>
  );

  const renderTableCompletion = () => (
    <div className="space-y-2">
      <p className="text-gray-700 dark:text-gray-300 mb-3">{question.questionText}</p>
      {question.tableStructure && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-600">
            <tbody>
              {question.tableStructure.rows?.map((row: any, rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.cells?.map((cell: any, cellIndex: number) => (
                    <td
                      key={cellIndex}
                      className="border border-gray-300 dark:border-gray-600 p-2 text-gray-800 dark:text-gray-200"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <input
        type="text"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        placeholder="Type your answer..."
      />
    </div>
  );

  const renderNoteCompletion = () => (
    <div className="space-y-2">
      <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{question.questionText}</p>
      </div>
      <input
        type="text"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        placeholder="Complete the note..."
      />
    </div>
  );

  const renderSentenceCompletion = () => (
    <div className="space-y-2">
      <p className="text-gray-700 dark:text-gray-300">{question.questionText}</p>
      <input
        type="text"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        placeholder="Complete the sentence..."
      />
    </div>
  );

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      <p className="text-gray-700 dark:text-gray-300 mb-3">{question.questionText}</p>
      <div className="space-y-2">
        {question.options?.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index);
          return (
            <label
              key={index}
              className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                answer === optionLabel
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900'
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-700'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={optionLabel}
                checked={answer === optionLabel}
                onChange={(e) => onAnswerChange(e.target.value)}
                disabled={disabled}
                className="mt-1 mr-3 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-gray-800 dark:text-gray-200">
                <strong>{optionLabel}.</strong> {option}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const renderMatching = () => (
    <div className="space-y-2">
      <p className="text-gray-700 dark:text-gray-300 mb-3">{question.questionText}</p>
      {question.options && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-3">
          <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">Options:</p>
          <div className="grid grid-cols-2 gap-2">
            {question.options.map((option, index) => (
              <div key={index} className="text-sm text-blue-700 dark:text-blue-300">
                <strong>{String.fromCharCode(65 + index)}.</strong> {option}
              </div>
            ))}
          </div>
        </div>
      )}
      <input
        type="text"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value.toUpperCase())}
        disabled={disabled}
        maxLength={1}
        className="w-20 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-bold disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        placeholder="A"
      />
    </div>
  );

  const renderMapLabeling = () => (
    <div className="space-y-2">
      <p className="text-gray-700 dark:text-gray-300 mb-3">{question.questionText}</p>
      {question.imageUrl && (
        <div className="mb-4 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <img
            src={question.imageUrl}
            alt="Map or diagram"
            className="w-full h-auto"
          />
        </div>
      )}
      <input
        type="text"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        placeholder="Type your answer..."
      />
    </div>
  );

  const renderQuestion = () => {
    switch (question.questionType) {
      case 'form_completion':
        return renderFormCompletion();
      case 'table_completion':
        return renderTableCompletion();
      case 'note_completion':
        return renderNoteCompletion();
      case 'sentence_completion':
        return renderSentenceCompletion();
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'matching':
        return renderMatching();
      case 'map_labeling':
        return renderMapLabeling();
      default:
        return renderFormCompletion();
    }
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <div className="flex items-start mb-4">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold mr-3 flex-shrink-0">
          {question.questionNumber}
        </span>
        <div className="flex-1">
          {renderQuestion()}
        </div>
      </div>
    </div>
  );
}
