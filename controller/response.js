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

// Delete User Response by responseId
export const deleteResponseById = async (req, res) => {
    try {
        const responseId = req.params.id;

        const deleteResponseSql = `DELETE FROM UserResponse WHERE ResponseID = ?`;

        db.run(deleteResponseSql, [responseId], function (err) {
            if (err) {
                console.error('Error deleting response:', err);
                res.status(500).json({ error: 'Failed to delete response' });
            } else if (this.changes === 0) {
                // No rows affected, response not found
                res.status(404).json({ message: 'Response not found' });
            } else {
                res.status(200).json({ message: 'Response deleted successfully' });
                console.log('Response deleted successfully');
            }
        });
    } catch (error) {
        console.error('Error deleting response:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Get Users by Techer Role
export const getTeachers = (req, res) => {
    // Remove any token verification lines for public access
    db.all(`SELECT * FROM Users WHERE UserRole = 'teacher'`, (err, rows) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.json(rows);
    });
};


export const createCourse = async (req, res) => {
    try {
        const { CourseName, description } = req.body;
        const insertCourseSql = `INSERT INTO Courses (CourseName, description) VALUES (?, ?)`;

        const courseId = await new Promise((resolve, reject) => {
            db.run(insertCourseSql, [CourseName, description], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        res.status(201).json({ courseId });
        console.log('Course created successfully');
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).send('Internal Server Error');
    }
};