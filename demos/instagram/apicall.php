<?php
if(isset($_GET['url']) && !empty($_GET['url'])) 
{
	$curl = curl_init();
	curl_setopt_array($curl, array(
			CURLOPT_RETURNTRANSFER => 1,
			CURLOPT_URL => $_GET['url']
	));
	$resp = curl_exec($curl);
	curl_close($curl);
	echo $resp;
}
elseif(isset($_POST['url']) && !empty($_POST['url']) && isset($_POST['access_token']) && !empty($_POST['access_token'])) 
{
	$curl = curl_init($_POST['url'].'?access_token='.$_POST['access_token']);
	if(isset($_POST['delete']) && ($_POST['delete']=='true')) {
		$curl = curl_init($_POST['url'].'?access_token='.$_POST['access_token']);
		$opt = array(
			CURLOPT_RETURNTRANSFER => 1,
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_CUSTOMREQUEST => "DELETE"
		);
	}
	else
	{
		$curl = curl_init($_POST['url']);
		$opt = array(
			CURLOPT_RETURNTRANSFER => 1,
			CURLOPT_POSTFIELDS => 'access_token='.$_POST['access_token'],
			CURLOPT_SSL_VERIFYPEER => false
		);
	}
	curl_setopt_array($curl, $opt);
	$resp = curl_exec($curl);
	curl_close($curl);
	echo $resp;
}
?>