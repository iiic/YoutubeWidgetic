<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

const TEMP_FILE_NAME = 'temp.json';
const MINUTE = 60;

$opts = [
	'http' => [
		'method' => 'GET',
	]
];

$context = stream_context_create($opts);

if (time() > ( filemtime(TEMP_FILE_NAME) + (5 * MINUTE) )) {
	$response = @file_get_contents('https://www.googleapis.com/youtube/v3/search?' . http_build_query($_GET), false, $context);
	file_put_contents(TEMP_FILE_NAME, $response);
} else {
	$response = file_get_contents(TEMP_FILE_NAME);
}

header('Content-Type: application/json');
echo ($response);
