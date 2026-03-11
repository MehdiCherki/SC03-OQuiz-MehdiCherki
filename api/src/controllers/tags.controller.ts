import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../models/index.ts";
import { ConflictError, NotFoundError } from "../lib/errors.ts";
import { parseIdFromParams } from "./utils.ts";

export async function getAllTags(req: Request, res: Response) {
  const tags = await prisma.tag.findMany({
    include: { children_tags: true },
  });

  res.json(tags);
}

export async function getOneTag(req: Request, res: Response) {
  const tagId = await parseIdFromParams(req.params.id);

  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    include: { children_tags: true },
  });
  if (!tag) {
    throw new NotFoundError("Tag not found");
  }

  res.json(tag);
}

export async function createTag(req: Request, res: Response) {
  const createTagBodySchema = z.object({
    name: z.string().min(1),
    parent_tag_id: z.number().int().positive().nullable().optional(),
  });

  const { name, parent_tag_id } = await createTagBodySchema.parseAsync(
    req.body,
  );

  // Vérifier l'unicité du nom
  const alreadyExistingTag = await prisma.tag.findFirst({ where: { name } });
  if (alreadyExistingTag) {
    throw new ConflictError(`Tag name already taken : ${name}`);
  }

  // Vérifier que le tag parent existe si fourni
  if (parent_tag_id) {
    const parentTag = await prisma.tag.findUnique({
      where: { id: parent_tag_id },
    });
    if (!parentTag) {
      throw new NotFoundError(`Parent tag not found: ${parent_tag_id}`);
    }
  }

  const createdTag = await prisma.tag.create({
    data: { name, parent_tag_id },
    include: { children_tags: true },
  });

  res.status(201).json(createdTag);
}

export async function updateTag(req: Request, res: Response) {
  const tagId = await parseIdFromParams(req.params.id);

  const updateTagBodySchema = z.object({
    name: z.string().min(1).optional(),
    parent_tag_id: z.number().int().positive().nullable().optional(),
  });
  const { name, parent_tag_id } = await updateTagBodySchema.parseAsync(
    req.body,
  );

  // Vérifier que le tag à mettre à jour existe
  const foundTag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!foundTag) {
    throw new NotFoundError(`Tag not found: ${tagId}`);
  }

  // Vérifier l'unicité du nom (en excluant le tag courant)
  if (name) {
    const alreadyExistingTag = await prisma.tag.findFirst({
      where: { name, id: { not: tagId } },
    });
    if (alreadyExistingTag) {
      throw new ConflictError(`Tag name already taken : ${name}`);
    }
  }

  // Vérifier que le tag parent existe si fourni
  if (parent_tag_id) {
    const parentTag = await prisma.tag.findUnique({
      where: { id: parent_tag_id },
    });
    if (!parentTag) {
      throw new NotFoundError(`Parent tag not found: ${parent_tag_id}`);
    }
  }

  const updatedTag = await prisma.tag.update({
    where: { id: tagId },
    data: { name, parent_tag_id },
    include: { children_tags: true },
  });

  res.json(updatedTag);
}

export async function deleteTag(req: Request, res: Response) {
  const tagId = await parseIdFromParams(req.params.id);

  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) {
    throw new NotFoundError("Tag not found");
  }

  await prisma.tag.delete({ where: { id: tagId } });

  res.status(204).end();
}
