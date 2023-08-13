"use strict";

import { ShaderDoodleElement } from 'shader-doodle';
import './style.css'
import 'shader-doodle';

// Logo movement
const pos = { x: 0, y: 0 };

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
  saveCursorPosition(
    scale(event.beta, -180, 180, -0.5, 0.5),
    scale(event.gamma, -90, 90, -0.5, 0.5)
  );
}

const isMobile = navigator.userAgentData.mobile;

if (isMobile) {
  window.addEventListener("deviceorientation", handleOrientation, true);
} else {
  document.addEventListener('mousemove', e => { saveCursorPosition(e.clientX, e.clientY); })
}

// Shadertoy API service

let shaderIds = [];
let currentShader = 1;
const API_KEY = "NtrlRN"; // TODO: Move to env var
const SHADER_DISPLAY_TIME = 4_000;

const SHADER_NAME_CONTAINER = document.body.querySelector("#shader-title");
const SHADER_DESCRIPTION_CONTAINER = document.body.querySelector("#shader-description");

const createShaderDoodle = (shaderCode, title, description) => {
  const doodle = new ShaderDoodleElement();
  doodle.shadertoy = true;
  doodle.id = "doodle";

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

  document.body.querySelector("#doodle")?.remove();
  document.body.appendChild(doodle);
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
    console.log("Shader ids not loaded yet");
    return;
  }
  const nextShader = await getShaderData(shaderIds[currentShader], API_KEY);
  currentShader = (currentShader + 1) % shaderIds.length;

  createShaderDoodle(nextShader.renderpass[0].code, nextShader.info.name, nextShader.info.description);
};

shaderIds = await getUserShadersIds("tanczmy", API_KEY);

if (shaderIds.length) {
  setInterval(nextDoodle, SHADER_DISPLAY_TIME);
}