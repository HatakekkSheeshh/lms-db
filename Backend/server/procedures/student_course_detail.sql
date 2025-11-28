-- ==================== STUDENT COURSE DETAIL PROCEDURES ====================
-- Description: Stored procedures for student course detail page
-- Includes: course info, sections, quizzes, grades, and students

USE [lms_system];
GO

-- ==================== GET STUDENT COURSE DETAIL ====================
-- Description: Get course information for a specific student
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentCourseDetail]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentCourseDetail]
GO

CREATE PROCEDURE [dbo].[GetStudentCourseDetail]
    @University_ID DECIMAL(7,0),
    @Course_ID NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            c.Course_ID,
            c.Name,
            c.Credit,
            c.CCategory
        FROM [Course] c
        INNER JOIN [Assessment] a ON c.Course_ID = a.Course_ID
        WHERE a.University_ID = @University_ID
          AND c.Course_ID = @Course_ID
          AND a.Status != 'Withdrawn'
        GROUP BY c.Course_ID, c.Name, c.Credit, c.CCategory;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== GET STUDENT COURSE SECTIONS ====================
-- Description: Get sections of a course that the student is enrolled in
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentCourseSections]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentCourseSections]
GO

CREATE PROCEDURE [dbo].[GetStudentCourseSections]
    @University_ID DECIMAL(7,0),
    @Course_ID NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT DISTINCT
            s.Section_ID,
            s.Course_ID,
            s.Semester
        FROM [Section] s
        INNER JOIN [Assessment] a ON s.Section_ID = a.Section_ID
            AND s.Course_ID = a.Course_ID
            AND s.Semester = a.Semester
        WHERE a.University_ID = @University_ID
          AND s.Course_ID = @Course_ID
          AND a.Status != 'Withdrawn'
        ORDER BY s.Semester, s.Section_ID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== GET STUDENT COURSE QUIZZES ====================
-- Description: Get quizzes for a course that the student can see, including their answers and scores
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentCourseQuizzes]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentCourseQuizzes]
GO

CREATE PROCEDURE [dbo].[GetStudentCourseQuizzes]
    @University_ID DECIMAL(7,0),
    @Course_ID NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT DISTINCT
            qq.QuizID,
            qq.Section_ID,
            qq.Course_ID,
            qq.Semester,
            ISNULL(qa.Assessment_ID, a.Assessment_ID) AS Assessment_ID,
            qq.Grading_method,
            qq.pass_score,
            qq.Time_limits,
            qq.Start_Date,
            qq.End_Date,
            qq.content,
            qq.types,
            qq.Weight,
            qq.Correct_answer,
            qq.Questions,
            -- Student's answer data
            qa.Responses,
            qa.completion_status,
            qa.score,
            -- Calculate if passed
            CASE 
                WHEN qa.score IS NOT NULL AND qa.score >= qq.pass_score THEN 'Passed'
                WHEN qa.completion_status = 'Submitted' AND (qa.score IS NULL OR qa.score < qq.pass_score) THEN 'Failed'
                WHEN qa.completion_status = 'In Progress' THEN 'In Progress'
                WHEN qa.completion_status = 'Submitted' THEN 'Submitted'
                ELSE 'Not Taken'
            END AS status_display
        FROM [Quiz_Questions] qq
        INNER JOIN [Assessment] a ON qq.Section_ID = a.Section_ID
            AND qq.Course_ID = a.Course_ID
            AND qq.Semester = a.Semester
        LEFT JOIN [Quiz_Answer] qa ON qq.QuizID = qa.QuizID
            AND qa.University_ID = @University_ID
        WHERE a.University_ID = @University_ID
          AND qq.Course_ID = @Course_ID
          AND a.Status != 'Withdrawn'
        ORDER BY qq.Start_Date DESC, qq.QuizID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== GET STUDENT COURSE GRADES ====================
-- Description: Get assessment grades for a student in a specific course
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentCourseGrades]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentCourseGrades]
GO

CREATE PROCEDURE [dbo].[GetStudentCourseGrades]
    @University_ID DECIMAL(7,0),
    @Course_ID NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            a.Assessment_ID,
            a.Section_ID,
            a.Course_ID,
            a.Semester,
            a.Quiz_Grade,
            a.Assignment_Grade,
            a.Midterm_Grade,
            a.Final_Grade,
            a.Status
        FROM [Assessment] a
        WHERE a.University_ID = @University_ID
          AND a.Course_ID = @Course_ID
          AND a.Status != 'Withdrawn'
        ORDER BY a.Semester, a.Section_ID, a.Assessment_ID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== GET STUDENT COURSE STUDENTS ====================
-- Description: Get list of students enrolled in the same course (for student view)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentCourseStudents]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentCourseStudents]
GO

CREATE PROCEDURE [dbo].[GetStudentCourseStudents]
    @Course_ID NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT DISTINCT
            u.University_ID,
            u.First_Name,
            u.Last_Name,
            u.Email,
            s.Major,
            s.Current_degree
        FROM [Users] u
        INNER JOIN [Student] s ON u.University_ID = s.University_ID
        INNER JOIN [Assessment] a ON s.University_ID = a.University_ID
        WHERE a.Course_ID = @Course_ID
          AND a.Status != 'Withdrawn'
        ORDER BY u.Last_Name, u.First_Name;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

