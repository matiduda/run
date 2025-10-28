"use strict";

import { ShaderDoodleElement } from 'shader-doodle';
import '../style.css'
import 'shader-doodle';

const delay = ms => new Promise(res => setTimeout(res, ms))

function getRandomInt(min, max) {
  return Math.floor(Math.random() * max) + min;
}

// SHADERTOY API DATA MOCK - Because ShaderToy API has been down for weeks :((((((((((((((

const SHADER_ID_ARRAY_MOCKED = [
  "M3BBWw",
  "DtXyDN",
  "dtXcW8",
];


// nextShader.renderpass[0].code, nextShader.info.name, nextShader.info.description
const SHADER_ID_TO_SHADER_INFO_JSON_MOCKED = [
  {
    id: SHADER_ID_ARRAY_MOCKED[0],
    renderpass: [{
      code: `float customCurve(float t) {
    // Example: Sinusoidal curve (ease-in, ease-out)
    return 0.5 - 0.5 * cos(3.14159 * t);

    // You can also try other curves like:
    // return t * t * (3.0 - 2.0 * t);  // Quadratic ease-in-out
    // return pow(t, 3.0);              // Cubic ease-in
    // return pow(t, 0.5);              // Square root (ease out)
}

float easeOutQuint(float t) {
    return 1.0 - pow(1.0 - t, 5.0);
}

float easeInOutCubic(float t) {
    return t < 0.5 
        ? 4.0 * t * t * t 
        : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

vec3 generateColor(float seed) {
    // Use sine waves to create smooth transitions in each RGB channel
    float r = 0.5 + 0.5 * sin(seed + 0.0); // Red channel
    float g = 0.5 + 0.5 * sin(seed + 2.0); // Green channel (phase-shifted)
    float b = 0.5 + 0.5 * sin(seed + 4.0); // Blue channel (phase-shifted)

    return vec3(r, g, b);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float TIME_MULTI = 2.0;
    
    float CELL_DURATION_VARIABILITY = clamp((2.0 * sin(iTime) + 1.0) / 150.0, 0.45, 0.6);
    
    float CELL_DURATION = 3.5 + CELL_DURATION_VARIABILITY;
    
    float TIME = iTime * TIME_MULTI;

    // Normalize pixel coordinates
    vec2 uv = fragCoord / iResolution.xy;

    // Grid dimensions
    
    float longerDimension = max(iResolution.x, iResolution.y);
    float shorterDimension = min(iResolution.x, iResolution.y);

    float aspectRatio = iResolution.x / iResolution.y;

    float gridSizeY = 5.0;
    
    float gridSize = floor(gridSizeY * aspectRatio);
    
    vec2 cellSize = vec2(1.0 / gridSize, 1.0 / gridSizeY);
    
    // Get the current cell index
    vec2 cellIndex = floor(uv / cellSize);
    
    // Calculate the local UV coordinates within the cell
    vec2 cellUV = fract(uv / cellSize);
    
    // Calculate the index of the cell we want to light up
    float totalCells = gridSizeY * gridSize;
    
    float cellNumber = mod(floor(TIME / CELL_DURATION), totalCells);

    float uniqueCellId = 0.0;

    float row = floor(cellNumber / gridSize);
    float column = mod(cellNumber, gridSize);
    
    // Check if the current cell is the active one
    float brightness = 0.0;
    
    // Use the main square for background
    float backgroundColorCellId = floor(TIME / CELL_DURATION);
    
    if(cellIndex.x == column && cellIndex.y == row) {
        float localTime = mod(TIME, CELL_DURATION);
        
        // Smoothly fade from white to black
        float t = clamp(localTime / CELL_DURATION, 0.0, 1.0);
        // Use the custom curve function to transition brightness
        brightness = easeOutQuint(t);
                
        uniqueCellId = floor(TIME / CELL_DURATION);
    }
    
    // Second cell

    float previousCellNumber = cellNumber - 1.0;

    if(cellNumber == 0.0) {
        previousCellNumber = totalCells - 1.0;
    }

    float previousRow = floor(previousCellNumber / gridSize);
    float previousColumn = mod(previousCellNumber, gridSize);
    
    if(cellIndex.x == previousColumn && cellIndex.y == previousRow) {
        float previouslocalTime = mod(TIME, CELL_DURATION);
        
        // Smoothly fade from white to black
        float t = clamp(previouslocalTime / CELL_DURATION, 0.0, 1.0);
        // Use the custom curve function to transition brightness
        brightness = easeInOutCubic(t);
        brightness = 1.0 - brightness;
        
        // Some nice animation
        brightness *= abs(cos((1.0 - cos(cellUV.x + cellUV.y + iTime)) * previouslocalTime));

        uniqueCellId = floor(TIME / CELL_DURATION) - 1.0;
    }
    
    vec3 backgroundColor = generateColor(iTime) * clamp(sin(uv.y + iTime), 0.8, 1.0);
    float backgroundColorStrength = 0.3;

    vec3 uniqueColor = generateColor(uniqueCellId);

    vec3 cellColor = brightness * uniqueColor;

    vec3 finalColor = cellColor + (backgroundColor * backgroundColorStrength);

    // Output to screen
    fragColor = vec4(finalColor, 1.0);
}
` }],
    info: {
      name: "A walker",
      description: "Goes and goes"
    }
  },
  {
    id: SHADER_ID_ARRAY_MOCKED[1],
    renderpass: [{
      code: `float random (vec2 st);
float circle(vec2 center, float radius, vec2 uv);
vec2 randomGradient(vec2 p);

vec2 cubic(vec2 p);
vec2 quintic(vec2 p);

vec3 palette(float t)
{
    vec3 a = vec3(0.498, 0.498, 0.558);
    vec3 b = vec3(0.418, 0.500, 0.358);
    vec3 c = vec3(1.168, 1.000, 1.778);
    vec3 d = vec3(-0.192, 0.333, 1.478);
    return a + b*cos( 6.28318*(c*t+d) );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;
    
    uv = uv * iResolution.xy / iResolution.y;

    // Normalized mouse position (from 0 to 1)
    vec2 mouse = iMouse.xy / iResolution.xy;

    // Nice oscilation
    // pow(tan(iTime), 4.0)

    // Make the grid
    float tiles = 4.8;
    
    // Vector rotation - from 0 to 1
    vec2 gridId = floor(uv * tiles);
    vec2 gridUv = fract(uv * tiles);
    
    vec2 color = gridUv;
    
    // Corners of each grid
    vec2 bl = gridId + vec2(0.0, 0.0);
    vec2 br = gridId + vec2(1.0, 0.0);
    vec2 tl = gridId + vec2(0.0, 1.0);
    vec2 tr = gridId + vec2(1.0, 1.0);
    
    // Random gradient for each corner
    vec2 gradientBl = randomGradient(bl);
    vec2 gradientBr = randomGradient(br);
    vec2 gradientTl = randomGradient(tl);
    vec2 gradientTr = randomGradient(tr);
    
    // Distance from current pixel to each corner
    vec2 distanceBl = gridUv - vec2(0.0, 0.0);
    vec2 distanceBr = gridUv - vec2(1.0, 0.0);
    vec2 distanceTl = gridUv - vec2(0.0, 1.0);
    vec2 distanceTr = gridUv - vec2(1.0, 1.0);
    
    // Dot product between distance and the random gradient
    float dotBl = dot(gradientBl, distanceBl);
    float dotBr = dot(gradientBr, distanceBr);
    float dotTl = dot(gradientTl, distanceTl);
    float dotTr = dot(gradientTr, distanceTr);
    
    // Smooth out the grid uvs
    //gridUv = smoothstep(0.0, 1., gridUv);
    //gridUv = cubic(gridUv);
    gridUv = quintic(gridUv);
    
    
    // Mix the colors
    float b = mix(dotBl, dotBr, gridUv.x);
    float t = mix(dotTl, dotTr, gridUv.x);
    float perlin = mix(b, t, gridUv.y);
  
    float finalColor = pow(1.0 - abs(perlin), 10.);
  
    // Output to screen
    fragColor = vec4(palette(finalColor + (sin(uv.x + iTime * .1) + sin(uv.y + iTime * .1))), 1.0);
}

// Random

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))
        * 43758.5453123);
}

vec2 randomGradient(vec2 p) {
  p = p + 0.02;
  float x = dot(p, vec2(123.4, 234.5));
  float y = dot(p, vec2(234.5, 345.6));
  vec2 gradient = vec2(x, y);
  gradient = sin(gradient);
  gradient = gradient * 43758.5453;

    

  // part 4.5 - update noise function with time
  gradient = 0.3 * sin(0.6 * gradient + 0.5 * iTime) + 0.2 * cos(0.4 * gradient + iTime * 0.3);
  return gradient;

  // gradient = sin(gradient);
  // return gradient;
}

// Interpolation

vec2 cubic(vec2 p) {
  return p * p * (3.0 - p * 2.0);
}

vec2 quintic(vec2 p) {
  return p * p * p * (10.0 + p * (-15.0 + p * 6.0));
}
` }],
    info: {
      name: "Ridged noise colors",
      description: "Random function for perlin noise"
    }
  },
  {
    id: SHADER_ID_ARRAY_MOCKED[2],
    renderpass: [{
      code: `// cosine based palette, 4 vec3 params
vec3 palette(float t)
{
    vec3 a = vec3(0.668, 0.608, 0.768);
    vec3 b = vec3(1.048, 0.548, 0.362);
    vec3 c = vec3(0.778, 1.338, 1.388);
    vec3 d = vec3(1.617, 1.528, 3.007);

    return a + b*cos( 6.28318*(c*t+d) );
}

vec2 rotateUV(vec2 uv, vec2 pivot, float rotation) {
    float cosa = cos(rotation);
    float sina = sin(rotation);
    uv -= pivot;
    return vec2(
        cosa * uv.x - sina * uv.y,
        cosa * uv.y + sina * uv.x 
    ) + pivot;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 res = iResolution.xy;
    
    // Translate (0, 0) to center
    vec2 uv = ((fragCoord * 2.0) - res) / res.y;
    uv = rotateUV(uv, vec2(0.0), iTime * .1);


    vec2 uv0 = uv * sin(iTime / 5.);
    
    vec3 finalColor = vec3(0.0);
    
    for(float i = 0.0; i < 3.0; i++) {
        uv = fract(uv * 1.6) - 0.5;

        float dist = length(uv) * exp(-length(uv0));

        // Color palette
        vec3 color = palette(length(uv0) + i * 0.4 - iTime * .2);

        dist = sin(dist * 8. + iTime * .3) / 8.;
        dist = abs(dist);

        dist = 0.01 / dist;

        finalColor += color * dist / 1.8;
    }
    
    finalColor.r = pow(finalColor.r, 1.2);
    finalColor.g = pow(finalColor.g, 1.6);
    finalColor.b = pow(finalColor.b, 1.6);

    float clmp = 0.05;

    finalColor = clamp(finalColor, 0., 1.0 - clmp) + clmp;
        
    fragColor = vec4(finalColor, 1.0);
}
` }],
    info: {
      name: "Hello world shader",
      description: "First shader"
    }
  }
];

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

// TODO: TO BE DELETED AFTER SHADERTOY API IS FIXED
const getUserShadersIdsMOCKED = async (username, apiKey) => {
  await delay(getRandomInt(100, 1000));

  return SHADER_ID_ARRAY_MOCKED;
}

const getShaderData = async (id, apiKey) => {
  // Get shader data from shadertoy API
  const response = await fetch(`https://www.shadertoy.com/api/v1/shaders/${id}?key=${apiKey}`);
  const shader = await response.json();
  return shader.Shader;
}

// TODO: TO BE DELETED AFTER SHADERTOY API IS FIXED
const getShaderDataMOCKED = async (id, apiKey) => {
  // Get shader data from shadertoy API
  return SHADER_ID_TO_SHADER_INFO_JSON_MOCKED.find(shader => shader.id === id);
}

const nextDoodle = async () => {
  if (!shaderIds.length) {
    console.log("[duduAPI] Shader ids not loaded yet");
    return;
  }
  const nextShader = await getShaderDataMOCKED(shaderIds[currentShader], API_KEY);
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

getUserShadersIdsMOCKED("tanczmy", API_KEY).then(fetchedIds => {
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
