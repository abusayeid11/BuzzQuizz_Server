import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

// Create Question
export const createQuestion = async (req, res) => {
    try {
        // Extract data from the request body
        const { QuestionText, QuestionType, QuizID } = req.body;

        // Insert the question into the Questions table
        const insertQuestionSql = `INSERT INTO Questions (QuestionText, QuestionType, QuizID) VALUES (?, ?, ?)`;

        const questionId = await new Promise((resolve, reject) => {
            db.run(
                insertQuestionSql,
                [QuestionText, QuestionType, QuizID],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        res.status(201).json({ questionId });
        console.log('Question created successfully');
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Get Questions by Quiz ID
export const getQuestionsByQuizId = async (req, res) => {
    try {
        const quizId = req.params.id;

        // Retrieve all questions associated with a specific quiz
        const selectQuestionsSql = `SELECT * FROM Questions WHERE QuizID = ?`;

        const questions = await new Promise((resolve, reject) => {
            db.all(selectQuestionsSql, [quizId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json(questions);
    } catch (error) {
        console.error('Error getting questions:', error);
        res.status(500).send('Internal Server Error');
    }
};
//get specific Questions
// export const getQuestionsWithOptionsByQuizId = async (req, res) => {
//     try {
//         const quizId = req.params.id;

//         // Retrieve all questions and their options associated with the given quiz
//         const selectQuestionsAndOptionsSql = `
//             SELECT q.QuestionID, q.QuestionText, q.QuestionType, o.OptionID, o.OptionText, o.IsCorrect
//             FROM Questions q
//             JOIN Options o ON q.QuestionID = o.QuestionID
//             WHERE q.QuizID = ?
//             ORDER BY q.QuestionID, o.OptionID
//         `;

//         const data = await new Promise((resolve, reject) => {
//             db.all(selectQuestionsAndOptionsSql, [quizId], (err, rows) => {
//                 if (err) reject(err);
//                 else resolve(rows);
//             });
//         });

//         const questionsWithOptions = [];
//         let currentQuestion = null;

//         data.forEach((row) => {
//             if (
//                 !currentQuestion ||
//                 row.QuestionID !== currentQuestion.QuestionID
//             ) {
//                 currentQuestion = {
//                     QuestionID: row.QuestionID,
//                     QuestionText: row.QuestionText,
//                     QuestionType: row.QuestionType,
//                     Options: [],
//                 };
//                 questionsWithOptions.push(currentQuestion);
//             }

//             currentQuestion.Options.push({
//                 OptionID: row.OptionID,
//                 OptionText: row.OptionText,
//                 IsCorrect: row.IsCorrect,
//             });
//         });

//         res.json(questionsWithOptions);
//     } catch (error) {
//         console.error('Error getting questions and options:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };


// Modify getQuestionsWithOptionsByQuizId
export const getQuestionsWithOptionsByQuizId = async (req, res) => {
    try {
        const quizId = req.params.id;

        // Retrieve all questions and their options or answers associated with the given quiz
        const selectQuestionsAndOptionsSql = `
            SELECT q.QuestionID, q.QuestionText, q.QuestionType, o.OptionID, o.OptionText, o.IsCorrect, sa.AnswerText
            FROM Questions q
            LEFT JOIN Options o ON q.QuestionID = o.QuestionID
            LEFT JOIN ShortAnswers sa ON q.QuestionID = sa.QuestionID
            WHERE q.QuizID = ?
            ORDER BY q.QuestionID, o.OptionID
        `;

        const data = await new Promise((resolve, reject) => {
            db.all(selectQuestionsAndOptionsSql, [quizId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const questionsWithOptions = [];
        let currentQuestion = null;

        data.forEach((row) => {
            if (!currentQuestion || row.QuestionID !== currentQuestion.QuestionID) {
                currentQuestion = {
                    QuestionID: row.QuestionID,
                    QuestionText: row.QuestionText,
                    QuestionType: row.QuestionType,
                    Options: [],
                    ShortAnswer: row.AnswerText || null,
                };
                questionsWithOptions.push(currentQuestion);
            }

            if (row.OptionID) {
                currentQuestion.Options.push({
                    OptionID: row.OptionID,
                    OptionText: row.OptionText,
                    IsCorrect: row.IsCorrect,
                });
            }
        });

        res.json(questionsWithOptions);
    } catch (error) {
        console.error('Error getting questions and options:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Update Question
export const updateQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        const { QuestionText, QuestionType, QuizID } = req.body;

        // Update the question in the Questions table
        const updateQuestionSql = `UPDATE Questions SET QuestionText = ?, QuestionType = ?, QuizID = ? WHERE QuestionID = ?`;

        const result = await new Promise((resolve, reject) => {
            db.run(
                updateQuestionSql,
                [QuestionText, QuestionType, QuizID, questionId],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });

        if (result === 0) {
            res.status(404).send('Question not found');
        } else {
            res.json({
                questionId,
                QuestionText,
                QuestionType,
                QuizID,
            });
        }
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete Question
export const deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;

        // Delete the question from the Questions table
        const deleteQuestionSql = `DELETE FROM Questions WHERE QuestionID = ?`;

        const result = await new Promise((resolve, reject) => {
            db.run(deleteQuestionSql, [questionId], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        if (result === 0) {
            res.status(404).send('Question not found');
        } else {
            res.json({ message: 'Question deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

//Get All Questions
export const getAllQuestions = async (req, res) => {
    try {
        const selectQuestionsSql = `SELECT * FROM Questions`;

        const questions = await new Promise((resolve, reject) => {
            db.all(selectQuestionsSql, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json(questions);
    } catch (error) {
        console.error('Error getting questions:', error);
        res.status(500).send('Internal Server Error');
    }
};

