<?php
namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin     = 'super_admin';
    case Admin          = 'admin';
    case Hrd            = 'hrd';
    case Finance        = 'finance';
    case ProjectManager = 'project_manager';
    case Supervisor     = 'supervisor';
    case Employee       = 'employee';

    public function label(): string
    {
        return match($this) {
            self::SuperAdmin     => 'Super Admin',
            self::Admin          => 'Admin',
            self::Hrd            => 'HRD',
            self::Finance        => 'Finance',
            self::ProjectManager => 'Project Manager',
            self::Supervisor     => 'Supervisor',
            self::Employee       => 'Karyawan',
        };
    }

    public function canManageDevices(): bool
    {
        return in_array($this, [self::SuperAdmin, self::Admin]);
    }
}
