-- Rol MEMBER para equipo de agencia (reemplaza MECHANIC en uso)

ALTER TYPE mecanico."Role" ADD VALUE IF NOT EXISTS 'MEMBER';

UPDATE mecanico."User" SET role = 'MEMBER' WHERE role = 'MECHANIC';
