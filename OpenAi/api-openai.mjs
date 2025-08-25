import { openai } from '@ai-sdk/openai';
import dotenv from "dotenv";
import { cosineSimilarity, embed, generateText } from 'ai';

dotenv.config();

export async function generateTextWithRAG(input, knowledgeBase) {
    const context = await generateContext(input, knowledgeBase);
    return generalTextCreation(input + "\n\n context: " + context)
}

export async function generalTextCreation(input) {
    const { text } = await generateText({
        model: openai(process.env.OPENAI_MODEL),
        instructions: "Responda perguntas de forma concisa e objetiva, condense as informações em paragrafos textuais (dissertativo). Passe somente as informações mais relevantes.",
        prompt: input
    });

    return text;
}

export async function generateContext(input, knowledgeBase) {
    const { embedding } = await embed({
        model: openai.textEmbeddingModel(process.env.OPENAI_EMBEDDING_MODEL),
        value: input,
    });
    const context = knowledgeBase
        .map(item => ({
            document: item,
            similarity: cosineSimilarity(embedding, item.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)
        .map(r => r.document.value)
        .join('\n');

    return context;
}