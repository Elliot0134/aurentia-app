-- Vérifier si les profils existent pour ces user_id spécifiques
SELECT 
  '92b92742-111d-4576-8955-b9b098598e9d' as user_id,
  CASE WHEN EXISTS (SELECT 1 FROM profiles WHERE id = '92b92742-111d-4576-8955-b9b098598e9d') 
       THEN 'EXISTS' ELSE 'MISSING' END as profile_status
UNION ALL
SELECT 
  'dcc693f5-6ed7-47aa-9c36-8f75a3652910',
  CASE WHEN EXISTS (SELECT 1 FROM profiles WHERE id = 'dcc693f5-6ed7-47aa-9c36-8f75a3652910') 
       THEN 'EXISTS' ELSE 'MISSING' END
UNION ALL
SELECT 
  '4233c85d-4526-4199-8379-2a010b1a4049',
  CASE WHEN EXISTS (SELECT 1 FROM profiles WHERE id = '4233c85d-4526-4199-8379-2a010b1a4049') 
       THEN 'EXISTS' ELSE 'MISSING' END;

-- Si ils existent, voir leurs détails
SELECT id, email, first_name, last_name, user_role 
FROM profiles 
WHERE id IN (
  '92b92742-111d-4576-8955-b9b098598e9d',
  'dcc693f5-6ed7-47aa-9c36-8f75a3652910', 
  '4233c85d-4526-4199-8379-2a010b1a4049'
);