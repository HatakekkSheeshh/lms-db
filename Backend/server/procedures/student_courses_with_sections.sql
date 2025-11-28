-- ==================== STUDENT COURSES WITH SECTIONS ====================
-- Description: Get courses with sections that a student is enrolled in
-- Each course will only show the section(s) the student is enrolled in

USE [lms_system];
GO

-- ==================== GET STUDENT COURSES WITH SECTIONS ====================
-- Description: Get courses with their sections that the student is enrolled in
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentCoursesWithSections]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentCoursesWithSections]
GO

CREATE PROCEDURE [dbo].[GetStudentCoursesWithSections]
    @University_ID DECIMAL(7,0)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT DISTINCT
            c.Course_ID,
            c.Name,
            c.Credit,
            c.CCategory,
            a.Section_ID,
            a.Semester
        FROM [Course] c
        INNER JOIN [Assessment] a ON c.Course_ID = a.Course_ID
        WHERE a.University_ID = @University_ID
          AND a.Status != 'Withdrawn'
        ORDER BY c.Course_ID, a.Semester, a.Section_ID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== GET STUDENT SECTION DETAIL ====================
-- Description: Get section detail for a student (verify enrollment)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentSectionDetail]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentSectionDetail]
GO

CREATE PROCEDURE [dbo].[GetStudentSectionDetail]
    @University_ID DECIMAL(7,0),
    @Section_ID NVARCHAR(10),
    @Course_ID NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT TOP 1
            s.Section_ID,
            s.Course_ID,
            s.Semester,
            c.Name AS Course_Name,
            c.Credit,
            c.CCategory
        FROM [Section] s
        INNER JOIN [Course] c ON s.Course_ID = c.Course_ID
        INNER JOIN [Assessment] a ON s.Section_ID = a.Section_ID
            AND s.Course_ID = a.Course_ID
            AND s.Semester = a.Semester
        WHERE a.University_ID = @University_ID
          AND s.Section_ID = @Section_ID
          AND s.Course_ID = @Course_ID
          AND a.Status != 'Withdrawn'
        ORDER BY s.Semester DESC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

