"use strict";

import { ShaderDoodleElement } from 'shader-doodle';
import '../style.css'
import 'shader-doodle';

// Logo movement
const pos = { x: -0.35, y: -0.35 };

const SHADER_NAME_CONTAINER = document.body.querySelector("#shader-title-text");
const SHADER_DESCRIPTION_CONTAINER = document.body.querySelector("#shader-description");

// Wierd transitions fix
setTimeout(() => {
  document.body.style.setProperty("--shader-display-transition", "0.7s")
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

const isMobile = navigator.userAgentData.mobile;

if (isMobile) {
  window.addEventListener("deviceorientation", handleOrientation, true);
} else {
  document.addEventListener('mousemove', e => { saveCursorPosition(e.clientX, e.clientY); })
}

// Spinner

const removeSpinner = () => document.querySelector("#loader")?.remove();

// Shadertoy API service

let shaderIds = [];
let currentShader = 1;
const API_KEY = "NtrlRN"; // TODO: Move to env var
const SHADER_DISPLAY_TIME = 4_000;

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

  createShaderDoodle(nextShader.renderpass[0].code, nextShader.info.name, nextShader.info.description);
};

getUserShadersIds("tanczmy", API_KEY).then(fetchedIds => {
  console.log("[duduAPI] Shader ID's loaded from ShaderToy API")
  shaderIds = fetchedIds;
  nextDoodle();
  setInterval(nextDoodle, SHADER_DISPLAY_TIME);
});