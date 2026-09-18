<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error'=>'Method not allowed']); exit; }
$raw=file_get_contents('php://input'); $data=json_decode($raw ?: '{}',true);
if (!is_array($data)) { http_response_code(400); echo json_encode(['error'=>'Invalid JSON']); exit; }
$visitorId=trim((string)($data['visitor_id']??''));
if (!preg_match('/^[A-Za-z0-9-]{16,80}$/',$visitorId)) { http_response_code(422); echo json_encode(['error'=>'Invalid visitor ID']); exit; }
$host=getenv('WF_DB_HOST') ?: ''; $db=getenv('WF_DB_NAME') ?: ''; $user=getenv('WF_DB_USER') ?: ''; $pass=getenv('WF_DB_PASS') ?: '';
if (!$host || !$db || !$user) { http_response_code(503); echo json_encode(['error'=>'CRM database is not configured']); exit; }
try {
  $pdo=new PDO("mysql:host={$host};dbname={$db};charset=utf8mb4",$user,$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false]);
  $email=null;
  if (isset($data['email']) && $data['email']!=='') { $email=filter_var($data['email'],FILTER_VALIDATE_EMAIL); if(!$email){http_response_code(422);echo json_encode(['error'=>'Invalid email']);exit;} }
  $firstVisit=null;
  if (!empty($data['first_visit'])) { $ts=strtotime((string)$data['first_visit']); if($ts!==false)$firstVisit=date('Y-m-d H:i:s',$ts); }
  $stmt=$pdo->prepare("INSERT INTO wf_visitors (visitor_id,email,first_visit,last_seen) VALUES (:id,:email,COALESCE(:first,NOW()),NOW()) ON DUPLICATE KEY UPDATE email=COALESCE(VALUES(email),email),last_seen=NOW()");
  $stmt->execute(['id'=>$visitorId,'email'=>$email,'first'=>$firstVisit]);
  if (!empty($data['provider_id']) && in_array($data['reaction']??'',['liked','disliked'],true)) {
    $providerId=substr(trim((string)$data['provider_id']),0,190); $providerName=substr(trim((string)($data['provider_name']??'')),0,190); $providerType=substr(trim((string)($data['provider_type']??'')),0,80); $reaction=$data['reaction'];
    $stmt=$pdo->prepare("INSERT INTO wf_provider_interactions (visitor_id,provider_id,provider_name,provider_type,reaction,interacted_at) VALUES (:visitor,:provider,:name,:type,:reaction,NOW()) ON DUPLICATE KEY UPDATE provider_name=VALUES(provider_name),provider_type=VALUES(provider_type),reaction=VALUES(reaction),interacted_at=NOW()");
    $stmt->execute(['visitor'=>$visitorId,'provider'=>$providerId,'name'=>$providerName,'type'=>$providerType,'reaction'=>$reaction]);
  }
  echo json_encode(['ok'=>true,'visitor_id'=>$visitorId]);
} catch (Throwable $e) {
  error_log('WellFinder CRM: '.$e->getMessage()); http_response_code(500); echo json_encode(['error'=>'Unable to save CRM record']);
}