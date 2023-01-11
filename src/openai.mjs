import {Configuration, OpenAIApi} from "@fortaine/openai";
import {streamCompletion} from "@fortaine/openai/stream";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const send_to_openai = async (prompt) => {
    try {
        const max_tokens = 2048 - prompt.length;

        const completion = await openai.createCompletion(
            {
                model: "text-davinci-003",
                max_tokens,
                prompt,
                stream: true,
            },
            {responseType: "stream"}
        );

        let result = "";
        for await (const message of streamCompletion(completion.data)) {
            try {
                const parsed = JSON.parse(message);
                const {text} = parsed.choices[0];

                result += text;

                // process.stdout.write(text);
            } catch (error) {
                console.error("Could not JSON parse stream message", message, error);
            }
        }

        return result.replace(/^\n*/g, "");
    } catch (error) {
        if (error.response?.status) {
            console.error(error.response.status, error.message);

            for await (const data of error.response.data) {
                const message = data.toString();

                try {
                    const parsed = JSON.parse(message);
                    console.error("An error occurred during OpenAI request: ", parsed);
                } catch (error) {
                    console.error("An error occurred during OpenAI request: ", message);
                }
            }
        } else {
            console.error("An error occurred during OpenAI request", error);
        }
    }
}

export { send_to_openai };
