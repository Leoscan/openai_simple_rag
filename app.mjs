import { generateTextWithRAG } from "./OpenAi/api-openai.mjs";
import { ChunkText } from "./OpenAi/knowledgeBaseSetup.mjs";
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function main() {
    const knowledgeBase = await ChunkText('./knowledge_base/knowledgeBase.txt');

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