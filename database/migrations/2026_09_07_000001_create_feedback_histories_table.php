<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback_histories', function (Blueprint $table) {
            $table->id();
            // feedback_id nullable karena saat dihapus, FK tidak lagi valid
            $table->unsignedBigInteger('feedback_id')->nullable();
            // user_id = pemilik feedback (tetap disimpan untuk query riwayat milik user)
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // actor_id = siapa yang melakukan aksi (admin/pengurus)
            $table->foreignId('actor_id')->constrained('users')->cascadeOnDelete();
            // Judul disimpan redundan agar tetap tampil walau feedback dihapus
            $table->string('feedback_title');
            $table->enum('action', ['status_changed', 'deleted']);
            $table->string('old_status')->nullable();
            $table->string('new_status')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'created_at']);
            $table->index('feedback_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_histories');
    }
};
