-- Script simplifié pour diagnostiquer les utilisateurs qui ne peuvent pas être supprimés

-- Vérifier les références pour TestUser (f5c21b7a-1501-45ed-863d-b99e8f76766b)
SELECT 'TestUser - project_summary' as check_type, COUNT(*) as count FROM project_summary WHERE user_id = 'f5c21b7a-1501-45ed-863d-b99e8f76766b'::uuid
UNION ALL
SELECT 'TestUser - conversation' as check_type, COUNT(*) as count FROM conversation WHERE user_id = 'f5c21b7a-1501-45ed-863d-b99e8f76766b'::uuid
UNION ALL
SELECT 'TestUser - messages' as check_type, COUNT(*) as count FROM messages WHERE user_id = 'f5c21b7a-1501-45ed-863d-b99e8f76766b'::uuid
UNION ALL
SELECT 'TestUser - invitation_code' as check_type, COUNT(*) as count FROM invitation_code WHERE created_by = 'f5c21b7a-1501-45ed-863d-b99e8f76766b'::uuid
UNION ALL
SELECT 'TestUser - organizations' as check_type, COUNT(*) as count FROM organizations WHERE created_by = 'f5c21b7a-1501-45ed-863d-b99e8f76766b'::uuid
UNION ALL
SELECT 'TestUser - mentors' as check_type, COUNT(*) as count FROM mentors WHERE user_id = 'f5c21b7a-1501-45ed-863d-b99e8f76766b'::uuid
UNION ALL
SELECT 'TestUser - mentor_assignments' as check_type, COUNT(*) as count FROM mentor_assignments WHERE assigned_by = 'f5c21b7a-1501-45ed-863d-b99e8f76766b'::uuid OR created_by = 'f5c21b7a-1501-45ed-863d-b99e8f76766b'::uuid

UNION ALL

-- Vérifier les références pour Matthieu (36052147-ac37-49d9-b07c-64978e07042c)
SELECT 'Matthieu - project_summary' as check_type, COUNT(*) as count FROM project_summary WHERE user_id = '36052147-ac37-49d9-b07c-64978e07042c'::uuid
UNION ALL
SELECT 'Matthieu - conversation' as check_type, COUNT(*) as count FROM conversation WHERE user_id = '36052147-ac37-49d9-b07c-64978e07042c'::uuid
UNION ALL
SELECT 'Matthieu - messages' as check_type, COUNT(*) as count FROM messages WHERE user_id = '36052147-ac37-49d9-b07c-64978e07042c'::uuid
UNION ALL
SELECT 'Matthieu - invitation_code' as check_type, COUNT(*) as count FROM invitation_code WHERE created_by = '36052147-ac37-49d9-b07c-64978e07042c'::uuid
UNION ALL
SELECT 'Matthieu - organizations' as check_type, COUNT(*) as count FROM organizations WHERE created_by = '36052147-ac37-49d9-b07c-64978e07042c'::uuid
UNION ALL
SELECT 'Matthieu - mentors' as check_type, COUNT(*) as count FROM mentors WHERE user_id = '36052147-ac37-49d9-b07c-64978e07042c'::uuid
UNION ALL
SELECT 'Matthieu - mentor_assignments' as check_type, COUNT(*) as count FROM mentor_assignments WHERE assigned_by = '36052147-ac37-49d9-b07c-64978e07042c'::uuid OR created_by = '36052147-ac37-49d9-b07c-64978e07042c'::uuid

ORDER BY check_type;