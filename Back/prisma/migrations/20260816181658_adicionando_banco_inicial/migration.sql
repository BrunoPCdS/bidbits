-- CreateEnum
CREATE TYPE "TipoMidia" AS ENUM ('Fita', 'DVD', 'CD');

-- CreateEnum
CREATE TYPE "Empresa" AS ENUM ('Nintendo', 'Sony', 'Microsoft', 'Xbox', 'Atari', 'Sega', 'Tectoy');

-- CreateTable
CREATE TABLE "marcas" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(30) NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consoles" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "marcaid" INTEGER NOT NULL,
    "empresa" "Empresa" NOT NULL DEFAULT 'Nintendo',
    "ano" SMALLINT NOT NULL,
    "foto" TEXT NOT NULL,
    "video" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletadoEm" TIMESTAMP(3),
    "deletadoPorId" INTEGER,
    "adminId" INTEGER NOT NULL,

    CONSTRAINT "consoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "midias" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT NOT NULL,
    "foto" TEXT NOT NULL,
    "ano" SMALLINT NOT NULL,
    "video" TEXT NOT NULL,
    "tipo" "TipoMidia" NOT NULL DEFAULT 'Fita',
    "marcaid" INTEGER NOT NULL,
    "empresa" "Empresa" NOT NULL DEFAULT 'Nintendo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminId" INTEGER NOT NULL,
    "deletadoEm" TIMESTAMP(3),
    "deletadoPorId" INTEGER,

    CONSTRAINT "midias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leiloes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorInicial" DOUBLE PRECISION NOT NULL,
    "midiaId" INTEGER,
    "consoleId" INTEGER,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminId" INTEGER NOT NULL,

    CONSTRAINT "leiloes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lances" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataLance" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "leilaoId" INTEGER NOT NULL,

    CONSTRAINT "lances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "consoles" ADD CONSTRAINT "consoles_marcaid_fkey" FOREIGN KEY ("marcaid") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consoles" ADD CONSTRAINT "consoles_deletadoPorId_fkey" FOREIGN KEY ("deletadoPorId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consoles" ADD CONSTRAINT "consoles_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "midias" ADD CONSTRAINT "midias_marcaid_fkey" FOREIGN KEY ("marcaid") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "midias" ADD CONSTRAINT "midias_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "midias" ADD CONSTRAINT "midias_deletadoPorId_fkey" FOREIGN KEY ("deletadoPorId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leiloes" ADD CONSTRAINT "leiloes_midiaId_fkey" FOREIGN KEY ("midiaId") REFERENCES "midias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leiloes" ADD CONSTRAINT "leiloes_consoleId_fkey" FOREIGN KEY ("consoleId") REFERENCES "consoles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leiloes" ADD CONSTRAINT "leiloes_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lances" ADD CONSTRAINT "lances_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lances" ADD CONSTRAINT "lances_leilaoId_fkey" FOREIGN KEY ("leilaoId") REFERENCES "leiloes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
