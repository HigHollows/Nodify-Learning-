import { prisma } from "../client.js";

export async function listAllDocChunks() {
  return prisma.docChunk.findMany();
}

export async function countDocChunks() {
  return prisma.docChunk.count();
}
