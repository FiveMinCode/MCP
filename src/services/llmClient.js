
require('dotenv').config();
const { InferenceClient } = require("@huggingface/inference");
const { spawn } = require('child_process');
const axios = require('axios');

const MISTRAL_MODEL_ID = 'j-hartmann/emotion-english-distilroberta-base'; // Or the specific Mistral model you want to use
const API_URL = `https://api-inference.huggingface.co/models/${MISTRAL_MODEL_ID}`;

async function callMistralModel(messages) {
  const client = new InferenceClient(process.env.key);
  const prompt = messages
    .map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
    .join('\n') + '\nCoach:';
  const output = await client.textClassification({
    model: "j-hartmann/emotion-english-distilroberta-base",
    inputs: prompt,
    provider: "hf-inference",
  });

  console.log(output);
  return output;
}

async function callOllama(messages) {
  // 1. Build the prompt string
  const prompt = messages
    .map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
    .join('\n') + '\nCoach:';

  // 2. Prepare the Ollama CLI args
  const args = [
    'run',
    process.env.OLLAMA_MODEL,    // e.g. "mistral:latest"
    // '--temperature', '0.7',
    // '--max-length',   '150'
  ];

  return new Promise((resolve, reject) => {
    // 3. Spawn the ollama process
    const child = spawn('ollama', args);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', err => {
      reject(err);
    });

    child.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`Ollama exited ${code}: ${stderr}`));
      }
      resolve(stdout.trim());
    });

    // 4. Write the prompt into Ollama’s stdin
    child.stdin.write(prompt);
    child.stdin.end();
  });
}


module.exports = {
  async generateReply(messages) {
    const provider = process.env.LLM_PROVIDER;
    if (provider === 'huggingface') {
      return callMistralModel(messages);
    }
    if (provider === 'ollama') {
      return callOllama(messages);
    }
    //throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
  }
};