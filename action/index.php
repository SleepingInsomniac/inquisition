<?php

$approved = [
	"get/test"
];

$response = array();

foreach ($_POST as $action) {
	$response[$action['name']] = array();
	if (in_array($action['name'], $approved))
		include "{$action['name']}.php";
}

echo json_encode($response);