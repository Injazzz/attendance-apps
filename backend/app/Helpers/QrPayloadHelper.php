<?php

namespace App\Helpers;

use InvalidArgumentException;

/**
 * QR Payload Helper - Parse and validate QR codes with employee and type information
 *
 * QR Payload Format:
 * {
 *   "employee_id": 123,
 *   "type": "department|site",
 *   "timestamp": 1713571200
 * }
 */
class QrPayloadHelper
{
    /**
     * Decode QR payload from string (JSON or base64 encoded JSON)
     *
     * @param string $payload Raw QR code data
     * @return array Decoded payload with employee_id and type
     * @throws InvalidArgumentException If payload is invalid
     */
    public static function decode(string $payload): array
    {
        $data = null;

        // Try to decode as base64 first (encrypted or encoded)
        $decoded = base64_decode($payload, true);
        if ($decoded !== false) {
            $data = json_decode($decoded, true);
        }

        // If not base64 or decoding failed, try as plain JSON
        if ($data === null) {
            $data = json_decode($payload, true);
        }

        // Validate decoded data
        if (!is_array($data)) {
            throw new InvalidArgumentException('Invalid QR payload format');
        }

        return self::validate($data);
    }

    /**
     * Validate QR payload contains required fields
     *
     * @param array $payload Decoded payload
     * @return array Validated payload
     * @throws InvalidArgumentException If required fields missing
     */
    public static function validate(array $payload): array
    {
        // Check required fields
        if (empty($payload['employee_id'])) {
            throw new InvalidArgumentException('QR payload missing employee_id');
        }

        if (empty($payload['type'])) {
            throw new InvalidArgumentException('QR payload missing type field');
        }

        // Validate type value
        $type = $payload['type'];
        if (!in_array($type, ['department', 'site'])) {
            throw new InvalidArgumentException('Invalid employee type: ' . $type);
        }

        return [
            'employee_id' => (int) $payload['employee_id'],
            'type'        => $type,
            'timestamp'   => $payload['timestamp'] ?? null,
        ];
    }

    /**
     * Encode payload for QR generation
     *
     * @param int $employeeId
     * @param string $type 'department' or 'site'
     * @return string JSON payload as string
     */
    public static function encode(int $employeeId, string $type): string
    {
        if (!in_array($type, ['department', 'site'])) {
            throw new InvalidArgumentException("Invalid type: {$type}. Must be 'department' or 'site'");
        }

        return json_encode([
            'employee_id' => $employeeId,
            'type'        => $type,
            'timestamp'   => now()->timestamp,
        ]);
    }

    /**
     * Encode payload as base64 (for mobile clients to scan)
     *
     * @param int $employeeId
     * @param string $type
     * @return string Base64 encoded JSON
     */
    public static function encodeBase64(int $employeeId, string $type): string
    {
        $json = self::encode($employeeId, $type);
        return base64_encode($json);
    }
}
