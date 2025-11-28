-- Procedure: Get All Student Grades
-- Description: Get all grades for a student from all sections they are enrolled in
-- This includes Quiz_Grade, Assignment_Grade, Midterm_Grade, Final_Grade from Assessment table
-- This is used for the student's grades overview page

USE [lms_system];
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentAllGrades]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentAllGrades]
GO

CREATE PROCEDURE [dbo].[GetStudentAllGrades]
    @University_ID DECIMAL(7,0)
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
            a.Status,
            a.Registration_Date,
            a.Potential_Withdrawal_Date,
            -- Course information
            c.Name AS Course_Name,
            c.Credit AS Credits,
            -- Calculate GPA: 10% Quiz, 20% Assignment, 20% Midterm, 50% Final
            CASE 
                WHEN a.Final_Grade IS NOT NULL THEN
                    (ISNULL(a.Quiz_Grade, 0) * 0.1 + 
                     ISNULL(a.Assignment_Grade, 0) * 0.2 + 
                     ISNULL(a.Midterm_Grade, 0) * 0.2 + 
                     ISNULL(a.Final_Grade, 0) * 0.5)
                ELSE NULL
            END AS GPA
        FROM [Assessment] a
        INNER JOIN [Course] c ON a.Course_ID = c.Course_ID
        WHERE a.University_ID = @University_ID
          AND a.Status != 'Withdrawn'
        ORDER BY a.Semester DESC, c.Name, a.Course_ID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

