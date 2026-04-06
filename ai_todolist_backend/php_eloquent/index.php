<?php
require 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;
$capsule->addConnection([
    'driver'   => 'sqlite',
    'database' => __DIR__ . '/logs.sqlite',
    'prefix'   => '',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

if (!Capsule::schema()->hasTable('logs')) {
    Capsule::schema()->create('logs', function ($table) {
        $table->increments('id');
        $table->string('acao');
        $table->text('detalhe');
        $table->integer('usuarioId')->nullable();
        $table->timestamps(); // Cria created_at e updated_at
    });
}

class Log extends \Illuminate\Database\Eloquent\Model {
    protected $table = 'logs';
    protected $fillable = ['acao', 'detalhe', 'usuarioId'];
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);

    try {
        $novoLog = Log::create([
            'acao' => $dados['acao'] ?? 'Indefinida',
            'detalhe' => $dados['detalhe'] ?? '',
            'usuarioId' => $dados['usuarioId'] ?? null
        ]);
        
        http_response_code(201);
        echo json_encode(['mensagem' => 'Log registrado com sucesso!', 'log' => $novoLog]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['erro' => 'Falha ao salvar log: ' . $e->getMessage()]);
    }
} else {
    http_response_code(404);
    echo json_encode(['erro' => 'Servico de Logs. Use o metodo POST para registrar.']);
}