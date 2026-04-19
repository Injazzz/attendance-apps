<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',
            'employees.view', 'employees.create', 'employees.edit',
            'employees.delete', 'employees.export',
            'attendance.view_own', 'attendance.view_all', 'attendance.view_team',
            'attendance.edit', 'attendance.manual_entry',
            'qr.view', 'qr.create', 'qr.regenerate', 'qr.manage',
            'overtime.request', 'overtime.approve_team', 'overtime.approve_all',
            'overtime.view_own', 'overtime.view_all',
            'reports.daily', 'reports.weekly', 'reports.monthly',
            'reports.yearly', 'reports.export',
            'settings.view', 'settings.edit',
            'sites.view', 'sites.create', 'sites.edit', 'sites.delete',
            'departments.manage', 'positions.manage',
            'companies.manage', 'users.manage', 'roles.manage',
            'notifications.send', 'notifications.view',
            'position_permissions.manage',
        ];

        // Guard name 'web' sesuai konvensi Laravel dengan tabel users
        foreach ($permissions as $perm) {
            Permission::firstOrCreate([
                'name'       => $perm,
                'guard_name' => 'web',
            ]);
        }

        $rolePermissions = [
            'super_admin' => $permissions,
            'admin'       => $permissions,
            'hrd'         => [
                'dashboard.view',
                'employees.view', 'employees.create',
                'employees.edit', 'employees.export',
                'attendance.view_all', 'attendance.edit',
                'attendance.manual_entry',
                'reports.daily', 'reports.weekly',
                'reports.monthly', 'reports.yearly', 'reports.export',
                'notifications.view', 'overtime.view_all',
                'departments.manage', 'positions.manage', 'sites.view',
            ],
            'finance' => [
                'dashboard.view',
                'attendance.view_all', 'overtime.view_all',
                'overtime.approve_all',
                'reports.daily', 'reports.monthly',
                'reports.yearly', 'reports.export',
            ],
            'project_manager' => [
                'dashboard.view',
                'employees.view', 'attendance.view_all',
                'attendance.view_team',
                'qr.view', 'qr.create', 'qr.regenerate', 'qr.manage',
                'overtime.view_all', 'overtime.approve_all',
                'reports.daily', 'reports.weekly',
                'reports.monthly', 'reports.export',
                'sites.view', 'sites.edit',
                'notifications.send', 'notifications.view',
            ],
            'supervisor' => [
                'dashboard.view',
                'employees.view', 'attendance.view_team',
                'qr.view',
                'overtime.view_own', 'overtime.approve_team',
                'reports.daily', 'reports.weekly',
                'notifications.view',
            ],
            'employee' => [
                'dashboard.view',
                'attendance.view_own',
                'overtime.request', 'overtime.view_own',
                'notifications.view',
            ],
        ];

        foreach ($rolePermissions as $roleName => $perms) {
            $role = Role::firstOrCreate([
                'name'       => $roleName,
                'guard_name' => 'web',
            ]);
            $role->syncPermissions($perms);
        }
    }
}
