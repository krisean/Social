-- Fix missing captain by promoting the first member to captain
UPDATE team_members 
SET is_captain = true 
WHERE id = (
    SELECT tm.id 
    FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    WHERE tm.team_id = '16dc1c27-6ae0-4668-92b4-2a3d91618e23'
    AND t.captain_id IS NULL
    ORDER BY tm.created_at ASC
    LIMIT 1
);

-- Update the team's captain_id
UPDATE teams 
SET captain_id = (
    SELECT tm.user_id 
    FROM team_members tm
    WHERE tm.team_id = '16dc1c27-6ae0-4668-92b4-2a3d91618e23'
    AND tm.is_captain = true
    LIMIT 1
)
WHERE id = '16dc1c27-6ae0-4668-92b4-2a3d91618e23';

-- Check the result
SELECT 
    t.id as team_id,
    t.team_name,
    t.captain_id,
    tm.user_id,
    tm.is_captain,
    tm.created_at
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE t.id = '16dc1c27-6ae0-4668-92b4-2a3d91618e23'
ORDER BY tm.created_at ASC;
