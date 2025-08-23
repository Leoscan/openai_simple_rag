import fs from 'fs';
import path from 'path';
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import dotenv from 'dotenv';

dotenv.config();

let knowledgeBase = [];

export async function ChunkText(file) {
    if (knowledgeBase.length > 0) return knowledgeBase;

    const essay = fs.readFileSync(path.join(file), 'utf8');

    const chunks = essay.split('.').map(chunk => chunk.trim()).
        filter(chunk => chunk.length > 0 && chunk !== '\n');

    const { embeddings } = await embedMany({
        model: openai.textEmbeddingModel(process.env.OPENAI_EMBEDDING_MODEL),
        values: chunks,
    });

    embeddings.forEach((e, i) => {
        knowledgeBase.push({
            embedding: e,
            value: chunks[i],
        });
    });

    return knowledgeBase;
}