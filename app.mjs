import { generateTextWithRAG } from "./OpenAi/api-openai.mjs";
import { ChunkMultipleFiles } from "./OpenAi/knowledgeBaseSetup.mjs";
import readline from 'readline';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

function getAllFiles(folderPath) {
    return fs
        .readdirSync(folderPath)
        .filter(file => file.endsWith(".txt"))
        .map(file => path.join(folderPath, file));
}

async function main() {
    const files = getAllFiles('./knowledge_base');
    const knowledgeBase = await ChunkMultipleFiles(files);

    while (true) {
        try {
            const input = await askQuestion('Digite sua pergunta: ');

            if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'sair' || input.toLowerCase() === 'quit') {
                console.log('👋 Até logo!');
                break;
            }

            const response = await generateTextWithRAG(input, knowledgeBase);
            console.log(response);

        } catch (error) {
            console.error('Erro ao processar pergunta:', error.message, '\n');
        }
    }
}

main();