-- Procedure: Get Student Schedule
-- Description: Get schedule for a student from all sections they are enrolled in
-- Includes Day_of_Week, Start_Period, End_Period from Scheduler table
-- Includes Building_Name and Room_Name from takes_place table
-- This is used for the student's schedule page

USE [lms_system];
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetStudentSchedule]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetStudentSchedule]
GO

CREATE PROCEDURE [dbo].[GetStudentSchedule]
    @University_ID DECIMAL(7,0)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            s.Section_ID,
            s.Course_ID,
            s.Semester,
            c.Name AS Course_Name,
            sch.Day_of_Week,
            sch.Start_Period,
            sch.End_Period,
            tp.Building_Name,
            tp.Room_Name
        FROM [Assessment] a
        INNER JOIN [Section] s ON a.Section_ID = s.Section_ID 
            AND a.Course_ID = s.Course_ID 
            AND a.Semester = s.Semester
        INNER JOIN [Course] c ON s.Course_ID = c.Course_ID
        INNER JOIN [Scheduler] sch ON s.Section_ID = sch.Section_ID
            AND s.Course_ID = sch.Course_ID
            AND s.Semester = sch.Semester
        LEFT JOIN [takes_place] tp ON s.Section_ID = tp.Section_ID
            AND s.Course_ID = tp.Course_ID
            AND s.Semester = tp.Semester
        WHERE a.University_ID = @University_ID
          AND a.Status != 'Withdrawn'
          AND sch.Day_of_Week IS NOT NULL
          AND sch.Start_Period IS NOT NULL
          AND sch.End_Period IS NOT NULL
        ORDER BY sch.Day_of_Week, sch.Start_Period;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

