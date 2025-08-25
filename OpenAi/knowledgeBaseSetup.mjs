import { Readers } from './readers.mjs';
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import dotenv from 'dotenv';

dotenv.config();

let knowledgeBase = [];

export async function ClearKnowledgeBase() {
    knowledgeBase = [];
}

export async function ChunkMultipleFiles(files) {
    await ClearKnowledgeBase();

    for (const file of files) {
        await ChunkText(file);
    }

    return knowledgeBase;
}

async function ChunkText(file) {
    const content = await ReadFiles(file);

    const chunks = content.split('.').map(chunk => chunk.trim()).
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

async function ReadFiles(file) {
    const reader = Readers.find(r => r.canHandle(file));

    if (!reader) console.warn(`Nenhum reader encontrado para: ${file}`);

    const content = await reader.read(file);

    return content;
}