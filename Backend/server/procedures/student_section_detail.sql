-- ==================== STUDENT SECTION DETAIL PROCEDURES ====================
-- Description: Stored procedures for student section detail page
-- Includes: quizzes, assignments, grades, and students for a specific section

USE [lms_system];
GO

-- ==================== GET STUDENT SECTION QUIZZES ====================
-- Description: Get quizzes for a specific section that the student can see
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentSectionQuizzes]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentSectionQuizzes]
GO

CREATE PROCEDURE [dbo].[GetStudentSectionQuizzes]
    @University_ID DECIMAL(7,0),
    @Section_ID NVARCHAR(10),
    @Course_ID NVARCHAR(15),
    @Semester NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT DISTINCT
            qq.QuizID,
            qq.Section_ID,
            qq.Course_ID,
            qq.Semester,
            a.Assessment_ID,
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
            AND qa.Assessment_ID = a.Assessment_ID
        WHERE a.University_ID = @University_ID
          AND qq.Section_ID = @Section_ID
          AND qq.Course_ID = @Course_ID
          AND qq.Semester = @Semester
          AND a.Status != 'Withdrawn'
        ORDER BY qq.Start_Date DESC, qq.QuizID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== GET STUDENT SECTION ASSIGNMENTS ====================
-- Description: Get assignments for a specific section that the student can see
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentSectionAssignments]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentSectionAssignments]
GO

CREATE PROCEDURE [dbo].[GetStudentSectionAssignments]
    @University_ID DECIMAL(7,0),
    @Section_ID NVARCHAR(10),
    @Course_ID NVARCHAR(15),
    @Semester NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT DISTINCT
            ad.AssignmentID,
            ad.Course_ID,
            ad.Semester,
            ad.instructions,
            ad.accepted_specification,
            ad.submission_deadline,
            -- Student's submission data
            asub.Assessment_ID,
            asub.score,
            asub.status,
            asub.SubmitDate,
            asub.late_flag_indicator,
            asub.attached_files,
            asub.Comments,
            -- Calculate status
            CASE 
                WHEN asub.status = 'Submitted' AND asub.SubmitDate IS NOT NULL THEN 'Submitted'
                WHEN ad.submission_deadline < GETDATE() AND asub.AssignmentID IS NULL THEN 'Overdue'
                WHEN asub.status = 'In Progress' THEN 'In Progress'
                WHEN asub.AssignmentID IS NOT NULL AND asub.status IS NOT NULL THEN asub.status
                ELSE 'Not Started'
            END AS status_display
        FROM [Assignment_Definition] ad
        INNER JOIN [Section] s ON ad.Course_ID = s.Course_ID
            AND ad.Semester = s.Semester
        INNER JOIN [Assessment] a ON s.Section_ID = a.Section_ID
            AND s.Course_ID = a.Course_ID
            AND s.Semester = a.Semester
        LEFT JOIN [Assignment_Submission] asub ON ad.AssignmentID = asub.AssignmentID
            AND asub.University_ID = @University_ID
        WHERE a.University_ID = @University_ID
          AND s.Section_ID = @Section_ID
          AND s.Course_ID = @Course_ID
          AND s.Semester = @Semester
          AND a.Status != 'Withdrawn'
        ORDER BY ad.submission_deadline DESC, ad.AssignmentID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== GET STUDENT SECTION GRADES ====================
-- Description: Get assessment grades for a student in a specific section
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentSectionGrades]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentSectionGrades]
GO

CREATE PROCEDURE [dbo].[GetStudentSectionGrades]
    @University_ID DECIMAL(7,0),
    @Section_ID NVARCHAR(10),
    @Course_ID NVARCHAR(15),
    @Semester NVARCHAR(10)
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
          AND a.Section_ID = @Section_ID
          AND a.Course_ID = @Course_ID
          AND a.Semester = @Semester
          AND a.Status != 'Withdrawn';
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== GET STUDENT SECTION STUDENTS ====================
-- Description: Get list of students enrolled in the same section
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentSectionStudents]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentSectionStudents]
GO

CREATE PROCEDURE [dbo].[GetStudentSectionStudents]
    @Section_ID NVARCHAR(10),
    @Course_ID NVARCHAR(15),
    @Semester NVARCHAR(10)
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
        WHERE a.Section_ID = @Section_ID
          AND a.Course_ID = @Course_ID
          AND a.Semester = @Semester
          AND a.Status != 'Withdrawn'
        ORDER BY u.Last_Name, u.First_Name;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

