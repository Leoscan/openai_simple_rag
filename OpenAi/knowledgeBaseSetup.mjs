import { Readers } from './readers.mjs';
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import dotenv from 'dotenv';

dotenv.config();

let knowledgeBase = [];

export async function ClearKnowledgeBase() {
    knowledgeBase = [];
}

export async function CreateKnowledgeBaseFromMultipleFiles(files) {
    await ClearKnowledgeBase();

    for (const file of files) {
        const content = await ReadFiles(file);
        const chunks = createSimpleChunks(content)
        await EmbedText(chunks);
    }

    return knowledgeBase;
}

async function EmbedText(chunks) {
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


function createSimpleChunks(text, maxChunkSize = 1000) {
    const cleanText = text.replace(/\s+/g, ' ').trim();

    if (cleanText.length <= maxChunkSize) return [cleanText];

    const chunks = [];
    let currentPosition = 0;

    while (currentPosition < cleanText.length) {
        let chunkEnd;

        if (currentPosition + maxChunkSize >= cleanText.length) {
            chunkEnd = cleanText.length;
        } else {
            chunkEnd = cleanText.indexOf('.', currentPosition + maxChunkSize);

            if (chunkEnd === -1) {
                chunkEnd = cleanText.length;
            } else {
                chunkEnd += 1;
            }
        }

        const chunk = cleanText.substring(currentPosition, chunkEnd).trim();

        if (chunk.length > 0) chunks.push(chunk);

        currentPosition = chunkEnd;
    }

    return chunks.filter(chunk => chunk.length > 0);
}