// find .image-prompt-form
import {runtime, storage} from 'webextension-polyfill';
import { sendMessage, onMessage } from 'webext-bridge'; 
import '/src/themeHandler.js';
import "./inject.css"
import { applyTheme } from '../themeHandler';
let injected = function () {
  return !!document.querySelector("#prompt-helper-btn");
};
let IMAGES_URL = runtime.getURL("img/");
let extension_url = runtime.getURL("");
let template = `
<button id="prompt-helper-btn" tabindex="0" class="btn btn-small btn-filled btn-primary" type="button">
	<span class="btn-label-wrap">
		<span class="btn-label-inner">
    Prompt Helper</span> 
	</span>
</button>

<a id="gpt3-synonym" data-selection="" class="btn btn-small btn-filled btn-primary">Synonym with GPT-3

</a>
<a id="gpt3-autocomplete" class="btn btn-small btn-outlined ">Autocomplete with GPT-3</a>

<a id="options-link" href="${extension_url}options.html" target="_blank" class="btn btn-small btn-icon btn-options">
<svg xmlns="http://www.w3.org/2000/svg" style="pointer-events:none" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
</svg>

<span class="btn-spinner"
      ><div class="spinner">
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="0"
          viewBox="0 0 1024 1024"
          class="spinner-spin"
          color="currentColor"
          height="1.2em"
          width="1.2em"
          xmlns="http://www.w3.org/2000/svg"
          style="color: currentcolor"
        >
          <path
            d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"
          ></path>
        </svg></div
    ></span>
</a>
`;


let darkModeToggle = `
<div class="dark-mode-toggle">
  <div class="dark-mode-active"></div>
  <div id="light-mode" class="btn btn-icon">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
    </svg>
  </div>
  <div id="dark-mode" class="btn btn-icon">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  </div>
</div>
`

let constructUi = function () {
  let htmlResult = ``;
  if (!window.prompts) {
    htmlResult = "<div>Something went wrong, no prompts found!</div>";
  } else {
    htmlResult = document.createDocumentFragment();
    let container = document.createElement("div");
    container.classList.add("helper-drawer");
    
    container.id = "prompt-helper-drawer";
    htmlResult.appendChild(container);
    htmlResult
        .querySelector("#prompt-helper-drawer")
        .insertAdjacentHTML("beforeEnd",darkModeToggle)
    for (let prompt in window.prompts) {
      let promptObj = window.prompts[prompt];
      let promptHtml = `
				<h4 class="prompt-group-title" title="${promptObj.description}">${promptObj.title}</h4>
				
				<div class="prompt-group-items" data-prefix="${promptObj.prefix}" data-suffix="${promptObj.suffix}">`;
      for (let item of promptObj.items) {
        promptHtml += `<a 
                class="prompt-group-item ${!item.img ? "btn btn-small btn-outlined" : ""} " 
								title="cmd+click to randomize : ${item.description}"
								data-title="${item.title}"
                ${item.prefix ? "data-prefix='"+item.prefix+"'" : ""} 
                ${item.suffix ? "data-suffix='"+item.suffix+"'" : ""} 
                
								data-variants="${item.variants.join(",")}"
								data-type="${item.type}">${item.title}`;
        if (item.img) {
          promptHtml += `<div class="preview-image"><img src="${IMAGES_URL}${item.img}" alt="${item.title}"/></div>`;
        }
        promptHtml += `</a>`;
      }
      promptHtml += `</div>`;
      htmlResult
        .querySelector("#prompt-helper-drawer")
        .appendChild(
          document.createRange().createContextualFragment(promptHtml)
        );
    }
  }
  return htmlResult;
};

let inject = async function () {

  let form = document.querySelector(".image-prompt-form");
  let header = document.querySelector(".image-prompt-form-header");
  let container = header.querySelector("div:first-child>div");
  container.insertAdjacentHTML("beforeend", template);

  let wrapper = document.querySelector(".image-prompt-form-wrapper");
  wrapper.append(constructUi());

  applyTheme()

  let input = document.querySelector(".image-prompt-input");


  container.addEventListener("click", async function (e) {

    if (e.target.id == "prompt-helper-btn") {
      document.querySelector("#prompt-helper-drawer").classList.toggle("open");
    }


    if (e.target.id == "gpt3-synonym") {
      document.querySelector('.btn-options').classList.add('loading');
      
      let selection = e.target.dataset.selection;
      let synonym = await sendMessage('get-synonym', {value: selection}, 'background');
      input.value = input.value.replace(input.value.substring(input.selectionStart, input.selectionEnd), synonym);
      
      document.querySelector('.btn-options').classList.remove('loading');
      setNativeValue(input, input.value); 
      let position = input.value.indexOf(synonym);
      console.log(position, input.value, synonym)
      input.setSelectionRange(position,position+synonym.length, 'forward');
      input.focus();
    }
    if (e.target.id == "gpt3-autocomplete") {
      let value = input.value;
      document.querySelector('.btn-options').classList.add('loading');
      let response = await sendMessage("get-autocomplete", { value: value }, 'background');
      document.querySelector('.btn-options').classList.remove('loading');
      //join into a single string, all strings and nested arrays in the response
      let autocomplete = response.map(item => {
        if (Array.isArray(item)) {
          let random = item[Math.floor(Math.random() * item.length)];
          return random; 
        }else{
          return item;
        }
      })
      
      input.value = autocomplete.join(" ")
      setNativeValue(input, input.value);
      input.focus();
    }
    
  });
  
  input.addEventListener("keyup", checkForSelection)
  input.addEventListener("mousedown", checkForSelection)
  input.addEventListener("mousemove", checkForSelection)

  document
    .querySelector("#prompt-helper-drawer")
    .addEventListener("click", function (e) {
      
      let suffix = e.target.dataset.suffix || e.target.parentNode.dataset.suffix || "";
      let prefix = e.target.dataset.prefix || e.target.parentNode.dataset.prefix || "";
      let is_command_down = e.metaKey || e.ctrlKey;
      if(input.selectionStart != input.selectionEnd) {
        input.value = input.value.replace(input.value.substring(input.selectionStart, input.selectionEnd),"");
      }
      let string = input.value;

      if (e.target.dataset.type == "random" || is_command_down) {
        let variants = e.target.dataset.variants.split(",");
        let random = variants[Math.floor(Math.random() * variants.length)];
        input.value += `${prefix}${random}${suffix}`;
      }
      if (e.target.dataset.type == "toggle" && !is_command_down) {
        let string = `${prefix}${e.target.dataset.title}${suffix}`;

        input.value.includes(string)
          ? (input.value = input.value.replace(string, ""))
          : (input.value += string); 
      }
      
      if (e.target.id == "light-mode") {
        applyTheme('light');
      }
      if (e.target.id == "dark-mode") {
        applyTheme('dark');
      }

      setNativeValue(input, input.value);
      input.focus();
    });

    
};

//global event handlers 
document.addEventListener("click", function (e) {
  if(e.target.classList.contains('btn-uncrop')) {
    let canvas = document.querySelector(".erasable-canvas canvas");
    let smol_canvas = document.querySelector("#smol-canvas");
    let ctx = canvas.getContext("2d");
    let smol_ctx = smol_canvas.getContext("2d");

    if(smol_canvas.dataset.empty == "true") {
      smol_canvas.dataset.empty = "false";
      smol_ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0,0,smol_canvas.width, smol_canvas.height)
    }
    
  }
  if(e.target.id == "top-right"){
    console.log("clicked top-right")
  }
  if(e.target.id == "top-left"){
    let canvas = document.querySelector(".erasable-canvas canvas");
    let smol_canvas = document.querySelector("#smol-canvas");
    let ctx = canvas.getContext("2d");
    ctx.drawImage(smol_canvas, 0, 0, smol_canvas.width, smol_canvas.height, 0,0,canvas.width, canvas.height)
    ctx.putImageData(smol_canvas.getContext('2d').getImageData(0,0,smol_canvas.width, smol_canvas.height),0, 0)
  }
  if(e.target.id == "bottom-right"){
    console.log("clicked bottom-right")
  }
  if(e.target.id == "bottom-left"){
    console.log("clicked bottom-left")
  }
})

var observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    // Observing the input to close out the drawer when the user submits the form
    if (mutation.type == "childList" && mutation.addedNodes.length > 0) {
      //iterate through the added nodes
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        let classes = mutation.addedNodes[i].classList;
        if (classes?.contains("edit-page")) {
          
          document.querySelector("#prompt-helper-drawer")?.classList.remove("open");
        }
        
        if(classes && classes.contains("page-wrapper") && document.querySelector(".image-editor-controls")) {  
          const template = `
          <div id="top-right" class="btn-icon btn-filled btn-secondary btn-uncrop">1</div>
          <div id="top-left" class="btn-icon btn-filled btn-secondary btn-uncrop">2</div>
          <div id="bottom-left" class="btn-icon btn-filled btn-secondary btn-uncrop">3</div>
          <div id="bottom-right" class="btn-icon btn-filled btn-secondary btn-uncrop">4</div>`
          document.querySelector(".image-editor-controls").insertAdjacentHTML("afterbegin", template);
          let canvas = document.querySelector(".erasable-canvas canvas");
          let smol_canvas = document.createElement("canvas");
          smol_canvas.id = "smol-canvas";
          smol_canvas.dataset.empty = "true";
          smol_canvas.width = canvas.offsetWidth / 2;
          smol_canvas.height = canvas.offsetHeight / 2;
          
          document.querySelector('.page-wrapper').insertAdjacentElement("beforeend", smol_canvas);
        }
      }
    }

    /* Observing the page to inject the template if needed on change of SPA */
    if (injected()) return;
    let form = document.querySelector(".image-prompt-form");
    if (form != null) {
      inject();
    }
  })
});
const config = { childList: true, subtree: true };
observer.observe(document.body, config);

// helper methods

function setNativeValue(element, value) {
  let lastValue = element.value;
  element.value = value;
  let event = new Event("input", { target: element, bubbles: true });
  // React 15
  event.simulated = true;
  // React 16
  let tracker = element._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }
  element.dispatchEvent(event);
}

function checkForSelection(){
  let input = document.querySelector(".image-prompt-input");
  let gpt_btn = document.querySelector("#gpt3-synonym");
    if(input.selectionStart != input.selectionEnd){
      gpt_btn.classList.add("selection");
      gpt_btn.dataset.selection = input.value.substring(input.selectionStart, input.selectionEnd);
    }else{
      gpt_btn.classList.remove("selection");
      gpt_btn.dataset.selection = ""; 
    }
}
