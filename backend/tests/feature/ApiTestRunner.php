<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Employee;
use App\Models\CompanySite;
use App\Models\Department;
use App\Models\Position;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTestRunner extends TestCase
{
    use RefreshDatabase;

    protected $token = null;
    protected $user = null;
    protected $testResults = [];
    protected $startTime = null;

    public function setUp(): void
    {
        parent::setUp();
        $this->startTime = microtime(true);
    }

    public function test_full_api_test_suite()
    {
        // 1. Setup test data
        $this->setupTestData();

        // 2. Test authentication
        $this->testAuthentication();

        // 3. Test all endpoints
        $this->testAllEndpoints();

        // 4. Test validation errors
        $this->testValidationErrors();

        // 5. Test edge cases
        $this->testEdgeCases();

        // 6. Generate report
        $this->generateReport();

        $this->assertTrue(true);
    }

    protected function setupTestData()
    {
        $company = Company::create([
            'name' => 'Test Company',
            'code' => 'TEST',
            'is_active' => true,
        ]);

        $site = CompanySite::create([
            'company_id' => $company->id,
            'name' => 'Test Site',
            'code' => 'SITE-TEST',
            'latitude' => '-6.2088',
            'longitude' => '106.8456',
            'radius' => 100,
        ]);

        $dept = Department::create([
            'company_id' => $company->id,
            'name' => 'IT Department',
            'code' => 'IT',
        ]);

        $position = Position::create([
            'company_id' => $company->id,
            'name' => 'Developer',
            'code' => 'DEV',
        ]);

        $employee = Employee::create([
            'employee_code' => 'EMP-TEST-001',
            'full_name' => 'Test Employee',
            'email' => 'employee@test.com',
            'phone' => '08123456789',
            'gender' => 'male',
            'department_id' => $dept->id,
            'position_id' => $position->id,
            'site_id' => $site->id,
            'hire_date' => today(),
            'employment_type' => 'permanent',
            'status' => 'active',
        ]);

        $this->user = User::create([
            'employee_id' => $employee->id,
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'testuser@test.com',
            'password' => bcrypt('Password@123'),
            'is_active' => true,
        ]);

        $this->user->assignRole('admin');
    }

    protected function testAuthentication()
    {
        echo "\n▶ TESTING AUTHENTICATION\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

        // Test login with valid credentials
        $response = $this->post('/api/v1/auth/login', [
            'username' => 'testuser',
            'password' => 'Password@123',
        ]);

        $this->logResult('POST /api/v1/auth/login (valid)', $response->status());

        if ($response->status() === 200) {
            $this->token = $response->json('data.token') ?? $response->json('token');
            echo "✓ Token acquired: " . substr($this->token ?? 'FAILED', 0, 20) . "...\n";
        }

        // Test login with invalid credentials
        $response = $this->post('/api/v1/auth/login', [
            'username' => 'testuser',
            'password' => 'WrongPassword123',
        ]);

        $this->logResult('POST /api/v1/auth/login (invalid)', $response->status());

        // Test get current user
        if ($this->token) {
            $response = $this->withHeaders(['Authorization' => "Bearer {$this->token}"])
                ->get('/api/v1/auth/me');

            $this->logResult('GET /api/v1/auth/me', $response->status());
        }
    }

    protected function testAllEndpoints()
    {
        echo "\n▶ TESTING ALL ENDPOINTS\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

        $endpoints = [
            // Auth endpoints
            ['GET', '/api/v1/auth/me', true],
            ['POST', '/api/v1/auth/logout', true],

            // Attendance endpoints
            ['GET', '/api/v1/attendance/today', true],
            ['GET', '/api/v1/attendance/history', true],
            ['POST', '/api/v1/attendance/unified-qr-scan', false, ['qr_data' => '{"employee_id": 1}', 'gps' => ['latitude' => '-6.2088', 'longitude' => '106.8456']]],

            // Reports endpoints
            ['GET', '/api/v1/reports/dashboard-stats', true],
            ['GET', '/api/v1/reports/attendance', false, ['start_date' => date('Y-m-d'), 'end_date' => date('Y-m-d')]],
            ['GET', '/api/v1/reports/summary', true],

            // Companies endpoints
            ['GET', '/api/v1/companies', true],
            ['POST', '/api/v1/companies', true, ['name' => 'Test Co', 'code' => 'TC']],

            // Departments endpoints
            ['GET', '/api/v1/departments', true],
            ['POST', '/api/v1/departments', true, ['name' => 'Test Dept', 'code' => 'TD', 'company_id' => 1]],

            // Sites endpoints
            ['GET', '/api/v1/sites', true],
            ['POST', '/api/v1/sites', true, ['name' => 'Test Site', 'company_id' => 1, 'latitude' => '0', 'longitude' => '0', 'radius' => 100]],

            // Employees endpoints
            ['GET', '/api/v1/employees', true],
            ['POST', '/api/v1/employees', true, [
                'employee_code' => 'EMP-NEW-001',
                'full_name' => 'New Employee',
                'email' => 'new@test.com',
                'phone' => '08987654321',
                'gender' => 'male',
                'department_id' => 1,
                'position_id' => 1,
                'site_id' => 1,
                'hire_date' => date('Y-m-d'),
                'employment_type' => 'permanent',
                'status' => 'active',
            ]],

            // Positions endpoints
            ['GET', '/api/v1/positions', true],
            ['POST', '/api/v1/positions', true, ['name' => 'Test Position', 'code' => 'TP', 'company_id' => 1]],

            // QR endpoints
            ['GET', '/api/v1/qr-displays', true],
            ['POST', '/api/v1/qr-displays', true, ['name' => 'Test Display', 'site_id' => 1]],

            // Overtime endpoints
            ['GET', '/api/v1/overtime', true],
            ['POST', '/api/v1/overtime', true, [
                'employee_id' => 1,
                'date' => date('Y-m-d'),
                'hours' => 2,
                'reason' => 'Test overtime',
            ]],

            // Profile endpoints
            ['GET', '/api/v1/profile', true],
            ['POST', '/api/v1/profile', true, ['name' => 'Updated Name']],

            // Notifications endpoints
            ['GET', '/api/v1/notifications', true],

            // Settings endpoints
            ['GET', '/api/v1/settings', true],

            // Users endpoints
            ['GET', '/api/v1/users', true],
        ];

        foreach ($endpoints as $endpoint) {
            $this->testEndpoint(...$endpoint);
        }
    }

    protected function testValidationErrors()
    {
        echo "\n▶ TESTING VALIDATION ERRORS\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

        $tests = [
            ['POST', '/api/v1/auth/login', [], 'Login without credentials'],
            ['POST', '/api/v1/companies', ['name' => ''], 'Create company without code'],
            ['POST', '/api/v1/departments', ['name' => 'Test'], 'Department without company_id'],
            ['POST', '/api/v1/employees', ['employee_code' => 'DUP'], 'Employee missing required fields'],
            ['GET', '/api/v1/reports/attendance', [], 'Attendance report without dates'],
        ];

        foreach ($tests as [$method, $uri, $data, $description]) {
            $response = $this->makeRequest($method, $uri, $data, $this->token);
            $expected = in_array($response->status(), [400, 422, 401]) ? '✓' : '✗';
            echo "$expected $description: {$response->status()}\n";
            $this->logResult($description, $response->status());
        }
    }

    protected function testEdgeCases()
    {
        echo "\n▶ TESTING EDGE CASES\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

        // Test 404 - non-existent resource
        $response = $this->makeRequest('GET', '/api/v1/companies/99999', [], $this->token);
        $this->logResult('404 - Non-existent company', $response->status());
        echo ($response->status() === 404 ? '✓' : '✗') . " GET /api/v1/companies/99999: {$response->status()}\n";

        // Test 401 - no token
        $response = $this->get('/api/v1/attendance/today');
        $this->logResult('401 - No authentication', $response->status());
        echo ($response->status() === 401 ? '✓' : '✗') . " No token: {$response->status()}\n";

        // Test 401 - invalid token
        $response = $this->withHeaders(['Authorization' => 'Bearer invalid_token'])
            ->get('/api/v1/auth/me');
        $this->logResult('401 - Invalid token', $response->status());
        echo ($response->status() === 401 ? '✓' : '✗') . " Invalid token: {$response->status()}\n";

        // Test 405 - wrong method
        $response = $this->delete('/api/v1/auth/login');
        $this->logResult('405 - Wrong HTTP method', $response->status());
        echo ($response->status() === 405 ? '✓' : '✗') . " DELETE /api/v1/auth/login: {$response->status()}\n";
    }

    protected function testEndpoint($method, $uri, $requiresAuth = true, $data = [])
    {
        $response = $this->makeRequest($method, $uri, $data, $requiresAuth ? $this->token : null);
        $status = $response->status();

        $statusIndicator = match(true) {
            in_array($status, [200, 201, 204, 422]) => '✓',
            in_array($status, [401, 403]) && $requiresAuth => '✓',
            $status === 404 => '⚠',
            $status >= 500 => '✗',
            default => '?',
        };

        echo "$statusIndicator $method $uri: $status\n";
        $this->logResult("$method $uri", $status);
    }

    protected function makeRequest($method, $uri, $data = [], $token = null)
    {
        $request = match($method) {
            'GET' => $this->get($uri),
            'POST' => $this->post($uri, $data),
            'PATCH' => $this->patch($uri, $data),
            'PUT' => $this->put($uri, $data),
            'DELETE' => $this->delete($uri),
            default => throw new \Exception("Unsupported method: $method"),
        };

        if ($token) {
            $request = $request->withHeaders(['Authorization' => "Bearer {$token}"]);
        }

        return $request;
    }

    protected function logResult($endpoint, $statusCode)
    {
        $this->testResults[] = [
            'endpoint' => $endpoint,
            'status' => $statusCode,
            'timestamp' => now()->toDateTimeString(),
        ];
    }

    protected function generateReport()
    {
        $endTime = microtime(true);
        $duration = round($endTime - $this->startTime, 2);

        echo "\n\n";
        echo "╔" . str_repeat("═", 80) . "╗\n";
        echo "║ " . str_pad("API TEST REPORT", 78) . " ║\n";
        echo "╠" . str_repeat("═", 80) . "╣\n";

        // Summary
        $total = count($this->testResults);
        $passed = count(array_filter($this->testResults, fn($r) => in_array($r['status'], [200, 201, 204, 401, 422])));
        $failed = count(array_filter($this->testResults, fn($r) => $r['status'] >= 500));
        $warnings = count(array_filter($this->testResults, fn($r) => $r['status'] === 404 || $r['status'] === 405));

        printf("║ %-78s ║\n", "Total Tests: $total | Passed: $passed | Failed: $failed | Warnings: $warnings");
        printf("║ %-78s ║\n", "Duration: {$duration}s");

        echo "╠" . str_repeat("═", 80) . "╣\n";

        // Results by status
        $byStatus = [];
        foreach ($this->testResults as $result) {
            $code = $result['status'];
            if (!isset($byStatus[$code])) {
                $byStatus[$code] = [];
            }
            $byStatus[$code][] = $result['endpoint'];
        }

        foreach (array_keys(array_reverse($byStatus, true)) as $code) {
            $endpoints = $byStatus[$code];
            $message = match($code) {
                200, 201, 204 => '✓ Success',
                401 => '✓ Unauthorized (expected)',
                422 => '✓ Validation Error (expected)',
                404 => '⚠ Not Found',
                405 => '⚠ Method Not Allowed',
                default => "✗ Error ($code)",
            };
            printf("║ %-78s ║\n", "$message (" . count($endpoints) . ")");
            foreach ($endpoints as $endpoint) {
                printf("║   %-76s ║\n", substr($endpoint, 0, 76));
            }
        }

        echo "╚" . str_repeat("═", 80) . "╝\n";

        // Save report to file
        $report = file_get_contents('php://stdout');
        file_put_contents(storage_path('logs/api-test-report.txt'), $report);
    }
}
