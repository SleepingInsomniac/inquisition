<?php

$approved = [
	"get/test"
];

$response = array();

foreach ($_POST as $method => $params) {
	$response[$method] = array();
	if (in_array($method, $approved))
		include "$method.php";
}

echo json_encode($response);