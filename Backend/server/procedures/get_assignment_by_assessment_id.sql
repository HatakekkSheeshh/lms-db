-- Procedure: Get Assignment by Assessment_ID
-- Description: Get assignment details from Assessment_ID (for student assignment submission)
-- This is needed because students navigate using Assessment_ID, not AssignmentID

USE [lms_system];
GO

-- ==================== GET ASSIGNMENT BY ASSESSMENT ID ====================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetAssignmentByAssessmentID]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetAssignmentByAssessmentID]
GO

CREATE PROCEDURE [dbo].[GetAssignmentByAssessmentID]
    @Assessment_ID INT,
    @University_ID DECIMAL(7,0) = NULL,
    @Section_ID NVARCHAR(10) = NULL,
    @Course_ID NVARCHAR(15) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Try to get AssignmentID from Assignment_Submission first
        DECLARE @AssignmentID INT = NULL
        
        IF @University_ID IS NOT NULL
        BEGIN
            SELECT TOP 1 @AssignmentID = AssignmentID
            FROM [Assignment_Submission]
            WHERE Assessment_ID = @Assessment_ID
                AND University_ID = @University_ID
        END
        ELSE
        BEGIN
            -- If no University_ID, try to get from any submission with this Assessment_ID
            SELECT TOP 1 @AssignmentID = AssignmentID
            FROM [Assignment_Submission]
            WHERE Assessment_ID = @Assessment_ID
        END
        
        -- If found AssignmentID from submission, get assignment details
        IF @AssignmentID IS NOT NULL
        BEGIN
            SELECT 
                ad.AssignmentID,
                ad.Course_ID,
                ad.Semester,
                ad.MaxScore,
                ad.accepted_specification,
                ad.submission_deadline,
                ad.instructions,
                ad.TaskURL,
                c.Name as Course_Name,
                (SELECT COUNT(*) FROM [Assignment_Submission] asub WHERE asub.AssignmentID = ad.AssignmentID) as StudentCount
            FROM [Assignment_Definition] ad
            INNER JOIN [Course] c ON ad.Course_ID = c.Course_ID
            WHERE ad.AssignmentID = @AssignmentID;
            RETURN;
        END
        
        -- If not found in Assignment_Submission, try to find assignment through Assessment and Section
        -- Join Assessment -> Section -> Assignment_Definition (by Course_ID and Semester)
        -- This handles the case where student hasn't submitted yet but assignment exists
        DECLARE @Semester NVARCHAR(10) = NULL
        DECLARE @FoundSection_ID NVARCHAR(10) = NULL
        DECLARE @FoundCourse_ID NVARCHAR(15) = NULL
        
        -- Get Semester, Section_ID, Course_ID from Assessment
        SELECT TOP 1 
            @Semester = Semester,
            @FoundSection_ID = Section_ID,
            @FoundCourse_ID = Course_ID
        FROM [Assessment]
        WHERE Assessment_ID = @Assessment_ID
            AND (@University_ID IS NULL OR University_ID = @University_ID)
            AND (@Section_ID IS NULL OR Section_ID = @Section_ID)
            AND (@Course_ID IS NULL OR Course_ID = @Course_ID)
        
        -- If we have Semester, try to find assignment by Course_ID and Semester
        IF @Semester IS NOT NULL
        BEGIN
            -- Use provided parameters or found values
            DECLARE @SearchSection_ID NVARCHAR(10) = ISNULL(@Section_ID, @FoundSection_ID)
            DECLARE @SearchCourse_ID NVARCHAR(15) = ISNULL(@Course_ID, @FoundCourse_ID)
            
            -- Get the assignment for this course and semester
            -- Join through Section to ensure assignment is available for this section
            SELECT TOP 1
                ad.AssignmentID,
                ad.Course_ID,
                ad.Semester,
                ad.MaxScore,
                ad.accepted_specification,
                ad.submission_deadline,
                ad.instructions,
                ad.TaskURL,
                c.Name as Course_Name,
                (SELECT COUNT(*) FROM [Assignment_Submission] asub WHERE asub.AssignmentID = ad.AssignmentID) as StudentCount
            FROM [Assignment_Definition] ad
            INNER JOIN [Course] c ON ad.Course_ID = c.Course_ID
            INNER JOIN [Section] s ON ad.Course_ID = s.Course_ID
                AND ad.Semester = s.Semester
            INNER JOIN [Assessment] a ON s.Section_ID = a.Section_ID
                AND s.Course_ID = a.Course_ID
                AND s.Semester = a.Semester
            WHERE a.Assessment_ID = @Assessment_ID
                AND ad.Course_ID = @SearchCourse_ID
                AND ad.Semester = @Semester
                AND (@SearchSection_ID IS NULL OR s.Section_ID = @SearchSection_ID)
            ORDER BY ad.submission_deadline DESC;
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

