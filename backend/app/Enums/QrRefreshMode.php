<?php
namespace App\Enums;

enum QrRefreshMode: string
{
    case TimeBased = 'time_based';
    case ScanBased = 'scan_based';
}
