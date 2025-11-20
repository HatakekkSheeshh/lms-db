-- Procedures: Audit Log Queries
-- Description: Get audit logs with various filters

-- ==================== GET ALL AUDIT LOGS ====================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetAllAuditLogs]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetAllAuditLogs]
GO

CREATE PROCEDURE [dbo].[GetAllAuditLogs]
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @University_ID DECIMAL(7,0) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
        
        SELECT 
            al.LogID,
            al.[timestamp],
            al.affected_entities,
            al.section_creation,
            al.deadline_extensions,
            al.grade_updates,
            rt.University_ID,
            u.First_Name,
            u.Last_Name,
            u.Email,
            CASE 
                WHEN EXISTS (SELECT 1 FROM [Admin] WHERE University_ID = rt.University_ID) THEN 'admin'
                WHEN EXISTS (SELECT 1 FROM [Tutor] WHERE University_ID = rt.University_ID) THEN 'tutor'
                WHEN EXISTS (SELECT 1 FROM [Student] WHERE University_ID = rt.University_ID) THEN 'student'
                ELSE 'unknown'
            END AS User_Role
        FROM [Audit_Log] al
        LEFT JOIN [Reference_To] rt ON al.LogID = rt.LogID
        LEFT JOIN [Users] u ON rt.University_ID = u.University_ID
        WHERE 
            (@StartDate IS NULL OR al.[timestamp] >= CAST(@StartDate AS DATE))
            AND (@EndDate IS NULL OR al.[timestamp] < DATEADD(DAY, 1, CAST(@EndDate AS DATE)))
            AND (@University_ID IS NULL OR rt.University_ID = @University_ID)
        ORDER BY al.[timestamp] DESC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY;
        
        -- Get total count
        SELECT COUNT(*) as total_count
        FROM [Audit_Log] al
        LEFT JOIN [Reference_To] rt ON al.LogID = rt.LogID
        WHERE 
            (@StartDate IS NULL OR al.[timestamp] >= CAST(@StartDate AS DATE))
            AND (@EndDate IS NULL OR al.[timestamp] < DATEADD(DAY, 1, CAST(@EndDate AS DATE)))
            AND (@University_ID IS NULL OR rt.University_ID = @University_ID);
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== GET AUDIT LOGS BY USER ====================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetAuditLogsByUser]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetAuditLogsByUser]
GO

CREATE PROCEDURE [dbo].[GetAuditLogsByUser]
    @University_ID DECIMAL(7,0),
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
        
        SELECT 
            al.LogID,
            al.[timestamp],
            al.affected_entities,
            al.section_creation,
            al.deadline_extensions,
            al.grade_updates,
            rt.University_ID,
            u.First_Name,
            u.Last_Name,
            u.Email,
            CASE 
                WHEN EXISTS (SELECT 1 FROM [Admin] WHERE University_ID = rt.University_ID) THEN 'admin'
                WHEN EXISTS (SELECT 1 FROM [Tutor] WHERE University_ID = rt.University_ID) THEN 'tutor'
                WHEN EXISTS (SELECT 1 FROM [Student] WHERE University_ID = rt.University_ID) THEN 'student'
                ELSE 'unknown'
            END AS User_Role
        FROM [Audit_Log] al
        INNER JOIN [Reference_To] rt ON al.LogID = rt.LogID
        INNER JOIN [Users] u ON rt.University_ID = u.University_ID
        WHERE rt.University_ID = @University_ID
            AND (@StartDate IS NULL OR al.[timestamp] >= CAST(@StartDate AS DATE))
            AND (@EndDate IS NULL OR al.[timestamp] < DATEADD(DAY, 1, CAST(@EndDate AS DATE)))
        ORDER BY al.[timestamp] DESC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY;
        
        -- Get total count
        SELECT COUNT(*) as total_count
        FROM [Audit_Log] al
        INNER JOIN [Reference_To] rt ON al.LogID = rt.LogID
        WHERE rt.University_ID = @University_ID
            AND (@StartDate IS NULL OR al.[timestamp] >= CAST(@StartDate AS DATE))
            AND (@EndDate IS NULL OR al.[timestamp] < DATEADD(DAY, 1, CAST(@EndDate AS DATE)));
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ==================== GET AUDIT LOG STATISTICS ====================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetAuditLogStatistics]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[GetAuditLogStatistics]
GO

CREATE PROCEDURE [dbo].[GetAuditLogStatistics]
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            COUNT(*) as total_logs,
            COUNT(DISTINCT rt.University_ID) as unique_users,
            COUNT(CASE WHEN al.section_creation IS NOT NULL THEN 1 END) as section_creations,
            COUNT(CASE WHEN al.deadline_extensions IS NOT NULL THEN 1 END) as deadline_extensions,
            COUNT(CASE WHEN al.grade_updates IS NOT NULL THEN 1 END) as grade_updates,
            COUNT(CASE WHEN al.affected_entities IS NOT NULL THEN 1 END) as entity_changes
        FROM [Audit_Log] al
        LEFT JOIN [Reference_To] rt ON al.LogID = rt.LogID
        WHERE 
            (@StartDate IS NULL OR al.[timestamp] >= CAST(@StartDate AS DATE))
            AND (@EndDate IS NULL OR al.[timestamp] < DATEADD(DAY, 1, CAST(@EndDate AS DATE)));
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

