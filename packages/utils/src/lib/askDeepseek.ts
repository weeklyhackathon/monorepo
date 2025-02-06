
export type StructuredOutputSchema<T extends string = string> = {
  properties: Record<T, {type: 'array', items: {type: 'string'}} | {type: 'string'}>
  required: T[]
}


type DeepseekRequest = {
  systemPrompt?: string;
  message: string;
  schema?: StructuredOutputSchema;
};


/**
 * Call the DeepSeek Chat API with the provided prompt.
 *
 * Expects the environment variable DEEPSEEK_API_KEY to be set.
 */
export async function askDeepseek(
  {
    systemPrompt = 'You are a helpful assistant.',
    message,
    schema
  }: DeepseekRequest
): Promise<any> {
  const apiUrl = 'https://api.deepseek.com/chat/completions';
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('Missing DeepSeek API key in environment');
  }

  if (schema) {
    systemPrompt += `\n\nYou have been provided a schema within which you should populate the response. The response must be in the following JSON format: ${JSON.stringify(schema, null, 2)}`;
  }

  const requestBody = {
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ],
    temperature: 0.2,
    // The response_format is used to instruct the API to return JSON.
    response_format: schema ? {
      type: 'json_object',
      schema: {
        type: 'object',
        ...schema
      }
    } : undefined,
    stream: false
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API call failed: ${response.statusText}`);
  }
  const data = await response.json();

  if (schema) {
    return JSON.parse(data.choices[0].message.content);
  }

  // Assumes the response is in the format with a choices array.
  return data.choices[0].message.content;
}

// askDeepseek({
//   message: 'What is the capital of France?',
//   schema: {
//     required: ['capital'],
//     properties: {
//       capital: {
//         type: 'string'
//       }
//     }
//   }
// }).then(console.log);
