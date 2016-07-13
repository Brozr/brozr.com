<?php

require_once '../vendor/autoload.php';
$config = require_once '../app/config.php';

/**
 * @param int $statusCode
 * @param null $errorMessage
 */
function sendResponse($statusCode = 200, $errorMessage = null)
{
    $statusCode = (int) $statusCode;
    $statusCodeMap = [
        200 => 'Ok',
        204 => 'No Content',
        400 => 'Bad Request',
        405 => 'Method Not Allowed',
    ];

    if (!isset($statusCodeMap[$statusCode])) {
        throw new InvalidArgumentException(
            sprintf('Invalid status code "%d". Possible values: "%s"',
                $statusCode,
                implode(', ', array_keys($statusCodeMap))
            )
        );
    }

    header(sprintf('%s %d %s', $_SERVER['SERVER_PROTOCOL'], $statusCode, $statusCodeMap[$statusCode]));

    if ($errorMessage && $statusCode !== 204) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => $errorMessage]);
    }
    
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(405, 'Method not allowed');
}

$data = array_merge([
    'name' => null,
    'email' => null,
    'message' => null,
], $_POST);

// Validate the data
if (empty($data['name']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL) || empty($data['message'])) {
    sendResponse(400, 'One or many fields are empty or invalid.');
}

// Smtp transport
$transport = new Swift_SmtpTransport($config['smtp']['host'], 465);
$transport->setAuthMode($config['smtp']['auth_mode'])
    ->setEncryption($config['smtp']['encryption'])
    ->setUsername($config['smtp']['username'])
    ->setPassword($config['smtp']['password'])
;

$mailer = Swift_Mailer::newInstance($transport);

// Build message
$messageBody = str_replace(
    ['#name#', '#email#', '#message#'],
    [$data['name'], $data['email'], $data['message']],
    $config['contact_template']
);

$message = Swift_Message::newInstance();
$message->setSubject($config['contact_subject'])
    ->setFrom($config['contact_email'])
    ->setTo($config['contact_email'])
    ->setBody($messageBody)
;

$sent = $mailer->send($message);

if ($sent === 0) {
    sendResponse(400, 'An error is happened...');
}

sendResponse(204);
