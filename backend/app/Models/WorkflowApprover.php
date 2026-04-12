<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowApprover extends Model
{
    protected $fillable = [
        'workflow_id','approver_position_id','approver_department_id',
        'approval_level','is_mandatory','can_delegate',
    ];

    public function workflow(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflow::class);
    }
}
