import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

// Submit Response
export const submitResponse = async (req, res) => {
    try {
        const { UserID, QuizID, QuestionID, ChosenOption, AnswerText, IsCorrect } = req.body;

        const insertResponseSql = `
            INSERT INTO UserResponse (UserID, QuizID, QuestionID, ChosenOption, AnswerText, IsCorrect)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(insertResponseSql, [UserID, QuizID, QuestionID, ChosenOption, AnswerText, IsCorrect], function (err) {
            if (err) {
                console.error('Error submitting response:', err);
                res.status(500).json({ error: 'Failed to submit response' });
            } else {
                res.status(201).json({ responseId: this.lastID });
                console.log('Response submitted successfully');
            }
        });
    } catch (error) {
        console.error('Error submitting response:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Get Responses by Quiz ID
export const getResponsesbyQuizID = async (req, res) => {
    try {
        const quizID = req.params.id;

        const sql = `
            SELECT 
    u.FirstName, 
    u.LastName, 
    q.QuestionText, 
    ur.ChosenOption, 
    ur.AnswerText, 
    ur.IsCorrect
FROM 
    UserResponse ur
JOIN 
    Users u ON ur.UserID = u.UserID
JOIN 
    Questions q ON ur.QuestionID = q.QuestionID
LEFT JOIN 
    Options o ON ur.ChosenOption = o.OptionID  -- Use LEFT JOIN to handle NULL ChosenOption
WHERE 
    ur.QuizID = ?;
        `;

        db.all(sql, [quizID], (err, rows) => {
            if (err) {
                console.error('Error fetching responses:', err);
                res.status(500).json({ error: 'Failed to fetch responses' });
            } else {
                res.json(rows);
            }
        });
    } catch (error) {
        console.error('Error getting responses:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Get All Responses
export const getAllResponses = async (req, res) => {
    try {
        const sql = `
            SELECT * FROM UserResponse
        `;

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Error fetching responses:', err); // Log the error for debugging
                res.status(500).json({ error: 'Failed to fetch responses' });
            } else {
                if (rows.length === 0) {
                    // If no responses are found, return an empty array
                    res.json({ message: 'No responses found', data: [] });
                } else {
                    // Return the found responses
                    res.json(rows);
                }
            }
        });
    } catch (error) {
        console.error('Error getting responses:', error);
        res.status(500).send('Internal Server Error');
    }
};
