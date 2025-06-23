/*
  Warnings:

  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE INDEX `users_id_idx` ON `users`(`id`);

-- CreateIndex
CREATE INDEX `users_username_idx` ON `users`(`username`);

-- CreateIndex
CREATE INDEX `users_createdAt_idx` ON `users`(`createdAt`);
