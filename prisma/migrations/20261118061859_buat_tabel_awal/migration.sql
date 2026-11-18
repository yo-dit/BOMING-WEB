-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "Pengirim" AS ENUM ('user', 'chatbot');

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "movies" (
    "id_movie" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "sinopsis" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "durasi" INTEGER NOT NULL,
    "poster" TEXT NOT NULL,
    "video_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id_movie")
);

-- CreateTable
CREATE TABLE "comments" (
    "id_comment" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_movie" INTEGER NOT NULL,
    "isi_komentar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id_comment")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id_rating" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_movie" INTEGER NOT NULL,
    "nilai" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id_rating")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id_message" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "pengirim" "Pengirim" NOT NULL,
    "pesan" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id_message")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_id_user_id_movie_key" ON "ratings"("id_user", "id_movie");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_id_movie_fkey" FOREIGN KEY ("id_movie") REFERENCES "movies"("id_movie") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_id_movie_fkey" FOREIGN KEY ("id_movie") REFERENCES "movies"("id_movie") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
