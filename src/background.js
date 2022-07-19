import { onMessage, sendMessage } from "webext-bridge";
import { storage } from "webextension-polyfill";
let OPENAI_URL = "https://api.openai.com/v1/edits";

let init = async function () {
  try {
    let { gpt3_api_key } = await storage.local.get("gpt3_api_key");
    if (!gpt3_api_key) {
      onMessage("get-synonym", () => {
        return "Configure your GPT-3 API key in the options page of the extension.";
      });
      onMessage("get-autocomplete", () => {
        return ["Configure your GPT-3 API key in the options page of the extension."];
      });
      throw new Error("No GPT-3 API key found!");
    }
    onMessage("get-synonym", async ({ data }) => {
      let payload = {
        model: "text-davinci-edit-001",
        input: data.value,
        instruction: "replace with a synonym",
        temperature: 0.94,
        top_p: 0.42,
      };
      try {
        const response = await fetch(OPENAI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${gpt3_api_key}`,
          },
          body: JSON.stringify(payload),
        });
        const json = await response.json();
        let synonym = json.choices[0].text;
        return synonym.replace(/\n/g, "");
      } catch (e) {
        console.error(e);
        return "Oops, there was an error getting a GPT-3 response";
      }
    });
    onMessage("get-autocomplete", async ({ data }) => {
      let payload = {
        model: "text-davinci-edit-001",
        input: JSON.stringify({
          subject: data.value,
          art_medium: "",
          action_being_taken: "",
          "4_additional_details_about_scene": [],
          composition: "",
          lighting: "",
          art_aesthetic: "",
          inspired_by_artist_or_artstyle: "",
        }),
        model: "text-davinci-edit-001",
        instruction: "Complete the blanks",
        temperature: 0.94,
        top_p: 0.42,
      };
      console.log(payload);
      try {
        const response = await fetch(OPENAI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${gpt3_api_key}`,
          },
          body: JSON.stringify(payload),
        });
        const json = await response.json();

        //contact all values in the json
        let prompt = Object.values(JSON.parse(json.choices[0].text));
        return prompt;
      } catch (e) {
        console.log(e);
        return ["Oops, there was an error getting a GPT-3 response"];
      }
    });
  } catch (e) {
    console.log(e)
    return ["Oops, there was an error getting a GPT-3 response"];
  }

  onMessage("get-stuff", (data) => {
    return {
      bgsomedata: "bgsomevalue",
    };
  });
};

init();
storage.onChanged.addListener((changes) => {
  if (changes.gpt3_api_key) {
    init();
  }
});
