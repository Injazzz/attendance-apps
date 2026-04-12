<?php
namespace App\Enums;

enum ScanType: string
{
    case CheckIn  = 'check_in';
    case CheckOut = 'check_out';
}
