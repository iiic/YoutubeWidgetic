<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

$opts = [
	'http' => [
		'method' => 'GET',
	]
];

$context = stream_context_create($opts);

$response = @file_get_contents('https://www.youtube.com/get_video_info?video_id=' . $_GET['id'], false, $context);
$filtered = strpos($response, 'playableInEmbed%22%3Atrue') ? 'true' : 'false';

echo ($filtered);
