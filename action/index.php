<?php

namespace Lx;

class AjaxController {
	
	static function test($params, $isPost = false) {
		return [
			'greeting' => "Hello, {$params['name']}!"
		];
	}
	
}

$response = array();

// run through post requests
foreach ($_POST as $method => $params) {
	if (method_exists('Lx\AjaxController', $method))
		$response[$method] = AjaxController::$method($params, true);
	else
		$response[$method] = ['error' => 'Not a method'];
}

// run through get requests
foreach ($_GET as $method => $params) {
	if (method_exists('Lx\AjaxController', $method))
		$response[$method] = AjaxController::$method($params, false);
	else
		$response[$method] = ['error' => 'Not a method'];
}


echo json_encode($response);