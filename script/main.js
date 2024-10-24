"use strict";

import { ShaderDoodleElement } from 'shader-doodle';
import '../style.css'
import 'shader-doodle';

// Logo movement
const pos = { x: -0.35, y: -0.35 };

const SHADER_NAME_CONTAINER = document.body.querySelector("#shader-title-text");
const SHADER_DESCRIPTION_CONTAINER = document.body.querySelector("#shader-description");
const API_NOT_RESPONDING_TEXT = document.body.querySelector("#api-not-responding");
const SHADER_BACKGROUND = document.body.querySelector("#shader-background");

// Wierd transitions fix
setTimeout(() => {
  document.body.style.setProperty("--shader-display-transition", "0.7s opacity ease")
  document.body.style.setProperty("--menu-buttons-transition", "0.3s")
  document.body.style.setProperty("--infobox-center-transition", "250ms opacity ease")
  document.body.style.setProperty("--arrow-show-hide-transition", "1s")
}, 1);

document.documentElement.style.setProperty('--x', pos.x);
document.documentElement.style.setProperty('--y', pos.y);

function saveCursorPosition(x, y) {
  pos.x = ((x - window.innerWidth / 2) / window.innerWidth).toFixed(2);
  pos.y = ((y - window.innerHeight / 2) / window.innerHeight).toFixed(2);
  document.documentElement.style.setProperty('--x', pos.x);
  document.documentElement.style.setProperty('--y', pos.y);
}

function scale(number, inMin, inMax, outMin, outMax) {
  return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

const handleOrientation = (event) => {
  pos.x = scale(event.gamma, -90, 90, -0.5, 0.5);
  pos.y = scale(event.beta, -180, 180, -0.5, 0.5);
  document.documentElement.style.setProperty('--x', pos.x);
  document.documentElement.style.setProperty('--y', pos.y);
}

window.mobileCheck = function () {
  let check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

if (window.mobileCheck()) {
  window.addEventListener("deviceorientation", handleOrientation, true);
} else {
  document.addEventListener('mousemove', e => { saveCursorPosition(e.clientX, e.clientY); })
}

// Spinner

const removeSpinner = () => document.querySelector("#loader")?.remove();

// Shadertoy API service

let shaderIds = [];
let currentShader = 1;
let initialized = false;

const API_KEY = "NtrlRN"; // TODO: Move to env var
const SHADER_DISPLAY_TIME = 7_000;
const API_NOT_RESPONDING_TIME = 5_000;

const createShaderDoodle = (shaderCode, title, description) => {
  const doodle = new ShaderDoodleElement();
  doodle.shadertoy = true;
  doodle.id = "doodle";
  doodle.classList.add("doodle");

  const fs = document.createElement("script");
  fs.type = "x-shader/x-fragment";
  fs.text = shaderCode;

  SHADER_NAME_CONTAINER.innerHTML = title.length
    ? title
    : "Untitled";
  SHADER_DESCRIPTION_CONTAINER.innerHTML = description.length
    ? description
    : "No description";

  doodle.appendChild(fs);

  let startingOpacity = 0;

  const currentDoodle = document.body.querySelector("#doodle");
  if (currentDoodle) {
    currentDoodle.remove();
    startingOpacity = 100;
  }

  doodle.style.opacity = startingOpacity;
  document.body.appendChild(doodle);
  setTimeout(() => {
    doodle.style.opacity = 100;
  });

  initialized = true;
}

const getUserShadersIds = async (username, apiKey) => {
  // Get shader data from shadertoy API
  const response = await fetch(`https://www.shadertoy.com/api/v1/shaders/query/${username}?key=${apiKey}`);
  const data = await response.json();
  return data.Results;
}

const getShaderData = async (id, apiKey) => {
  // Get shader data from shadertoy API
  const response = await fetch(`https://www.shadertoy.com/api/v1/shaders/${id}?key=${apiKey}`);
  const shader = await response.json();
  return shader.Shader;
}

const nextDoodle = async () => {
  if (!shaderIds.length) {
    console.log("[duduAPI] Shader ids not loaded yet");
    return;
  }
  const nextShader = await getShaderData(shaderIds[currentShader], API_KEY);
  removeSpinner();

  currentShader = (currentShader + 1) % shaderIds.length;

  if (initialized && currentShaderLocked) {
    return;
  }

  createShaderDoodle(nextShader.renderpass[0].code, nextShader.info.name, nextShader.info.description);
};

const displayAPINotRespondingText = () => {
  if (shaderIds.length) {
    // Shaders are loaded
    return;
  }
  API_NOT_RESPONDING_TEXT.style.opacity = 1;
}

getUserShadersIds("tanczmy", API_KEY).then(fetchedIds => {
  console.log("[duduAPI] Shader ID's loaded from ShaderToy API")
  shaderIds = fetchedIds;
  API_NOT_RESPONDING_TEXT.style.opacity = 0;
  nextDoodle();
  setInterval(nextDoodle, SHADER_DISPLAY_TIME);
});

setInterval(displayAPINotRespondingText, API_NOT_RESPONDING_TIME);

// Tab buttons

let arrowShowTimeoutId = null;

function openTab(event, tabName) {
  const currentButton = event.target;

  hideArrow();

  let clickedOnActiveTab = false;

  // Hide all elements with class="tabcontent" by default */
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
    // Also hide the parent
    tabcontent[i].parentElement.style.opacity = 0;
  }

  // Remove the background color of all tablinks/buttons
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    if (tablinks[i].style.backgroundColor !== "" && tablinks[i].id === currentButton.id) {
      clickedOnActiveTab = true;
    }

    tablinks[i].style.backgroundColor = "";
    tablinks[i].style.color = "#ffffff";
  }

  // Show the specific tab content
  const tab = document.getElementById(tabName);
  tab.style.display = "block";

  if (clickedOnActiveTab) {
    arrowShowTimeoutId = showArrowAfterTimeout();
    return;
  }

  tab.parentElement.style.opacity = 100;

  // Add the specific color to the button used to open the tab content
  currentButton.style.backgroundColor = "#ffffffdd";
  currentButton.style.color = "#000000";
}

// Shader lock button

let currentShaderLocked = false;
const SHADER_LOCKED_TEXT = document.body.querySelector("#locked-text");

function toggleShaderLock(event) {
  currentShaderLocked = !currentShaderLocked;

  const button = event.target;

  if (currentShaderLocked) {
    SHADER_LOCKED_TEXT.style.opacity = 100;
    button.style.backgroundColor = "#ffffff88";
    button.style.color = "#000000";
  } else {
    SHADER_LOCKED_TEXT.style.opacity = 0;
    button.style.backgroundColor = "";
    button.style.color = "#ffffff";
  }

}

document.querySelector("#aboutmeButton").addEventListener("click", (event) => openTab(event, 'aboutme'))
document.querySelector("#projectsButton").addEventListener("click", (event) => openTab(event, 'projects'))
document.querySelector("#contactButton").addEventListener("click", (event) => openTab(event, 'contact'))
document.querySelector("#lockShaderButton").addEventListener("click", (event) => toggleShaderLock(event))

function hideArrow() {
  if (arrowShowTimeoutId) {
    clearTimeout(arrowShowTimeoutId);
    arrowShowTimeoutId = null;
    return;
  }
  const arrowElement = document.querySelector("#arrow");
  arrowElement.style.opacity = 0;
}

function showArrow() {
  const arrowElement = document.querySelector("#arrow");
  arrowElement.style.opacity = 100;
  arrowShowTimeoutId = null;
}

function showArrowAfterTimeout() {
  return setTimeout(showArrow, 3_000);
}
