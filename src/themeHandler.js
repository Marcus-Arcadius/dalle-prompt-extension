import { storage } from "webextension-polyfill";
export let applyTheme = async function(newTheme){
    if(!newTheme){
        newTheme = await storage.local.get("theme").then(r => r.theme);
    }
    if(newTheme == "system"){
      let systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if(systemTheme){
        newTheme = "dark";
      }else{
        newTheme = "light";
      } 
    }
    document.querySelector('html').dataset.theme = newTheme;
  }
  
  storage.onChanged.addListener((changes) => {
    if(changes.theme){
      applyTheme(changes.theme.newValue);
    }
  });
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    console.log('preferring system')
    applyTheme("system");
  });