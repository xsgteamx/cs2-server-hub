<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$configFile = getenv('CS2_STATUS_CONFIG') ?: dirname(__DIR__) . '/_private/status.env';

function json_out(array $data): void
{
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function base_response(string $status, bool $online, string $label, string $text): array
{
    return [
        'status' => $status,
        'online' => $online,
        'label' => $label,
        'text' => $text,
        'status_text' => $label,
        'statusText' => $label,
        'main' => '服务器状态：' . $label,
        'sub' => $text,
        'message' => $text,
        'checked_at' => date('Y-m-d H:i:s'),
    ];
}

if (!is_readable($configFile)) {
    json_out(base_response('unknown', false, '未知', '状态接口配置不可用'));
}

$cfg = parse_ini_file($configFile, false, INI_SCANNER_RAW);

$host = trim($cfg['CS2_QUERY_HOST'] ?? '');
$port = (int)($cfg['CS2_QUERY_PORT'] ?? 0);
$timeout = (float)($cfg['CS2_STATUS_TIMEOUT'] ?? 1.5);

if ($host === '' || $port <= 0) {
    json_out(base_response('unknown', false, '未知', '状态检测配置不完整'));
}

function cs2_udp_check(string $host, int $port, float $timeout): bool
{
    $errno = 0;
    $errstr = '';

    $fp = @stream_socket_client(
        "udp://{$host}:{$port}",
        $errno,
        $errstr,
        $timeout,
        STREAM_CLIENT_CONNECT
    );

    if (!$fp) {
        return false;
    }

    $sec = (int)$timeout;
    $usec = (int)(($timeout - $sec) * 1000000);
    stream_set_timeout($fp, $sec, $usec);

    $packet = "\xFF\xFF\xFF\xFFTSource Engine Query\x00";
    @fwrite($fp, $packet);

    $data = @fread($fp, 4096);
    fclose($fp);

    return ($data !== false && strlen($data) > 0);
}

$online = cs2_udp_check($host, $port, $timeout);

if ($online) {
    json_out(base_response('running', true, '运行中', 'CS2 服务器已响应，外网转发链路正常'));
}

json_out(base_response('stopped', false, '未响应', '暂未收到 CS2 服务器响应'));