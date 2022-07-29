<script setup>
import { ref, computed } from "vue";
import { onMessage, sendMessage } from "webext-bridge";
import { storage } from "webextension-polyfill";
import { applyTheme } from "./themeHandler";

// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup

import Button from "./components/Button.vue";

let gpt3_api_key = ref("");
let theme = ref("system");
let watermark = ref("include");

storage.local.get().then(function (result) {
  gpt3_api_key.value = result["gpt3_api_key"];
  theme.value = result.theme || theme.value;
  watermark.value = result.watermark || watermark.value;
  applyTheme(result.theme);
});

let save = function (e) {
  e.preventDefault();
  storage.local.set({ gpt3_api_key: gpt3_api_key.value });
  storage.local.set({ theme: theme.value });
  storage.local.set({ watermark: watermark.value });
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

let reset = function () {
  gpt3_api_key.value = "";
  storage.local.set({ gpt3_api_key: gpt3_api_key.value });
  storage.local.set({ theme: "system" });
  storage.local.set({ watermark: "include" });
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

applyTheme();
</script>

<template>
  <div
    class="container px-4 mx-auto max-w-4xl mt-5 mb-8 first:mt-0 last:mb-0 pt-2 rounded-xl shadow-lg overflow-hidden dark:ring-1 dark:ring-white/10 dark:ring-inset prose dark:prose-invert prose-slate bg-slate-100 dark:bg-gray-800 top-5 relative"
  >
    <!-- This example requires Tailwind CSS v2.0+ -->
    <div class="">
      <div class="px-4 py-5 pt-5">
        <div class="">
          <h3 class="text-lg font-medium leading-6">DALL-E Prompt helper settings</h3>
          <p class="max-w-2xl mt-1 text-sm">
            These settings are used to help you configure the DALL-E Prompt helper.
          </p>
        </div>

        <form
          class="space-y-8 divide-y divide-gray-200 dark:divide-gray-700"
          @submit="save"
        >
          <div class="pt-5">
            <div class="mt-6 space-y-6 sm:mt-5 sm:space-y-5">
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                <label for="apikey" class="block text-sm font-medium sm:mt-px sm:pt-2">
                  GPT-3 API key
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <div class="flex max-w-lg rounded-md shadow-sm">
                    <span
                      class="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md sm:text-sm"
                    >
                      API KEY
                    </span>
                    <input
                      type="text"
                      name="apikey"
                      v-model="gpt3_api_key"
                      id="apikey"
                      autocomplete="apikey"
                      class="flex-1 block w-full h-10 min-w-0 rounded-none rounded-r-md sm:text-sm dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <p class="max-w-2xl mt-1 text-sm">
                    Your GPT-3 token will be stored in your browsers local storage, you
                    can generate a specific API key for this extension
                    <a
                      class=""
                      href="https://beta.openai.com/account/api-keys"
                      target="_blank"
                      >here</a
                    >
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="pt-6 sm:pt-5">
            <div role="group" aria-labelledby="label-notifications">
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-baseline">
                <div>
                  <div class="text-base font-medium sm:text-sm" id="label-notifications">
                    Dark mode-ification
                  </div>
                </div>
                <div class="sm:col-span-2">
                  <div class="max-w-lg">
                    <p class="text-sm">Choose preferred theme</p>
                    <div class="mt-4 space-y-4">
                      <div class="flex items-center">
                        <input
                          id="light-mode"
                          value="light"
                          v-model="theme"
                          name="theme"
                          type="radio"
                          class="h-4 w-4"
                        />
                        <label for="light-mode" class="ml-3 block text-sm font-medium">
                          Light (OpenAi default)
                        </label>
                      </div>
                      <div class="flex items-center">
                        <input
                          id="dark-mode"
                          value="dark"
                          v-model="theme"
                          name="theme"
                          type="radio"
                          class="h-4 w-4"
                        />
                        <label for="dark-mode" class="ml-3 block text-sm font-medium">
                          Dark
                        </label>
                      </div>
                      <div class="flex items-center">
                        <input
                          id="system-default"
                          value="system"
                          v-model="theme"
                          name="theme"
                          type="radio"
                          class="h-4 w-4"
                        />
                        <label
                          for="system-default"
                          class="ml-3 block text-sm font-medium"
                        >
                          System setting
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="pt-6 sm:pt-5">
            <div role="group" aria-labelledby="label-notifications">
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-baseline">
                <div>
                  <div class="text-base font-medium sm:text-sm" id="label-notifications">
                    DALL-E watermark
                  </div>
                </div>
                <div class="sm:col-span-2">
                  <div class="max-w-lg">
                    <p class="text-sm">
                      Include
                      <img
                        class="inline-block"
                        width="20"
                        src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2280%22%20height%3D%2216%22%20viewBox%3D%220%200%2080%2016%22%20class%3D%22image-signature%22%3E%3Cpath%20d%3D%22M0%200h16v16H0z%22%20fill%3D%22%23ff6%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M16%200h16v16H16z%22%20fill%3D%22%2342ffff%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M32%200h16v16H32z%22%20fill%3D%22%2351da4c%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M48%200h16v16H48z%22%20fill%3D%22%23ff6e3c%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M64%200h16v16H64z%22%20fill%3D%22%233c46ff%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
                      />
                      watermark on downloaded images
                    </p>
                    <div class="mt-4 space-y-4">
                      <div class="flex items-center">
                        <input
                          id="watermark-on"
                          value="include"
                          v-model="watermark"
                          name="watermark"
                          type="radio"
                          class="h-4 w-4"
                        />
                        <label for="watermark-on" class="ml-3 block text-sm font-medium">
                          Include (OpenAi default)
                        </label>
                      </div>
                      <div class="flex items-center">
                        <input
                          id="watermark-off"
                          value="exclude"
                          v-model="watermark"
                          name="watermark"
                          type="radio"
                          class="h-4 w-4"
                        />
                        <label for="watermark-off" class="ml-3 block text-sm font-medium">
                          Remove watermark
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="pt-10">
                <p class="max-w-2xl mt-1 text-sm">
                  Please see Dall-e
                  <a href="https://labs.openai.com/policies/terms">terms of use</a> for
                  more information.
                </p>
              </div>
            </div>
          </div>

          <div class="pt-5 no-prose">
            <div class="flex justify-end">
              <Button @click="reset" class="btn-secondary" icon="delete">
                Reset settings
              </Button>

              <Button type="submit" class="ml-3 btn-primary"> Save </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
