-- Procedures: Course CRUD Operations
-- Description: Create, Read, Update, Delete operations for Courses

-- ==================== GET ALL COURSES ====================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetAllCourses]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetAllCourses]
GO

CREATE PROCEDURE [dbo].[GetAllCourses]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Course_ID, Name, Credit, Start_Date 
    FROM [Course] 
    ORDER BY Course_ID;
END
GO

-- ==================== GET ALL COURSES WITH STATISTICS ====================
-- Description: Get all courses with section, student, and tutor counts for course management table
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetAllCoursesWithStats]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetAllCoursesWithStats]
GO

CREATE PROCEDURE [dbo].[GetAllCoursesWithStats]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.Course_ID,
        c.Name,
        c.Credit,
        c.Start_Date,
        -- Count distinct sections for this course
        (SELECT COUNT(*) 
         FROM [Section] s 
         WHERE s.Course_ID = c.Course_ID) as SectionCount,
        -- Count distinct students enrolled in this course across all sections
        (SELECT COUNT(DISTINCT a.University_ID) 
         FROM [Assessment] a 
         INNER JOIN [Section] s ON a.Section_ID = s.Section_ID 
             AND a.Course_ID = s.Course_ID 
             AND a.Semester = s.Semester
         WHERE s.Course_ID = c.Course_ID) as StudentCount,
        -- Count distinct tutors teaching this course across all sections
        (SELECT COUNT(DISTINCT t.University_ID) 
         FROM [Teaches] t 
         INNER JOIN [Section] s ON t.Section_ID = s.Section_ID 
             AND t.Course_ID = s.Course_ID 
             AND t.Semester = s.Semester
         WHERE s.Course_ID = c.Course_ID) as TutorCount
    FROM [Course] c
    ORDER BY c.Course_ID;
END
GO

-- ==================== CREATE COURSE ====================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CreateCourse]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[CreateCourse]
GO

CREATE PROCEDURE [dbo].[CreateCourse]
    @Course_ID NVARCHAR(15),
    @Name NVARCHAR(100),
    @Credit INT = NULL,
    @Start_Date DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO [Course] (Course_ID, Name, Credit, Start_Date)
        VALUES (@Course_ID, @Name, @Credit, @Start_Date);
        
        SELECT @Course_ID as Course_ID, @Name as Name, @Credit as Credit, @Start_Date as Start_Date;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== UPDATE COURSE ====================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UpdateCourse]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[UpdateCourse]
GO

CREATE PROCEDURE [dbo].[UpdateCourse]
    @Course_ID NVARCHAR(15),
    @Name NVARCHAR(100) = NULL,
    @Credit INT = NULL,
    @Start_Date DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [Course]
        SET 
            Name = ISNULL(@Name, Name),
            Credit = ISNULL(@Credit, Credit),
            Start_Date = ISNULL(@Start_Date, Start_Date)
        WHERE Course_ID = @Course_ID;
        
        IF @@ROWCOUNT = 0
            THROW 50001, 'Course not found', 1;
            
        SELECT Course_ID, Name, Credit, Start_Date 
        FROM [Course] 
        WHERE Course_ID = @Course_ID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== DELETE COURSE ====================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DeleteCourse]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[DeleteCourse]
GO

CREATE PROCEDURE [dbo].[DeleteCourse]
    @Course_ID NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DELETE FROM [Course] 
        WHERE Course_ID = @Course_ID;
        
        IF @@ROWCOUNT = 0
            THROW 50001, 'Course not found', 1;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

