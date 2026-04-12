<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ApprovalWorkflow extends Model
{
    protected $fillable = [
        'workflow_name','workflow_type','department_id','position_id',
        'approval_type','max_approval_level','auto_approve_days','is_active',
    ];

    public function approvers(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(WorkflowApprover::class, 'workflow_id');
    }
}
