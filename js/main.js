import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//Keep track of the mouse position
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let object;
const loader = new GLTFLoader();

let isMoving = true; // Variable to track if the rocket should move

//Load the file
loader.load(
  `models/rocket/scene.gltf`,
  function (gltf) {
    //If the file is loaded, add it to the scene
    object = gltf.scene;
    scene.add(object);
  },
);

//Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true }); //Alpha: true allows for the transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

//Add the renderer to the DOM
const container = document.getElementById("container3D");
container.appendChild(renderer.domElement);

// Set up a click event listener to toggle rocket movement
container.addEventListener("click", function (event) {
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  // Calculate normalized device coordinates (-1 to +1) for the mouse
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Set the picking ray from the camera's perspective
  raycaster.setFromCamera(mouse, camera);

  // Check if the ray intersects with the rocket
  const intersects = raycaster.intersectObject(object, true);

  if (intersects.length > 0) {
    isMoving = !isMoving; // Toggle the boolean variable only if the rocket is clicked
  }
});

//Set how far the camera will be from the 3D model
camera.position.z = 5;

//Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500) //top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 1);
scene.add(ambientLight);

function animate() {
  requestAnimationFrame(animate);

  if (object && isMoving) {
    // Calculate the velocity vector towards the cursor
    const velocity = new THREE.Vector2(mouseX - window.innerWidth / 2, mouseY - window.innerHeight / 2);
    velocity.normalize();

    // Move away from the cursor along both the x and y axes
    const moveSpeed = 0.02;
    object.position.x -= moveSpeed * velocity.x;
    object.position.y += moveSpeed * velocity.y;

    // Set rotation based on the velocity vector
    object.rotation.z = Math.atan2(velocity.x, velocity.y);

    // Limit the movement to keep the rocket within a reasonable range
    const maxMove = 2;
    object.position.x = Math.min(Math.max(object.position.x, -maxMove * 2), maxMove * 2);
    object.position.y = Math.min(Math.max(object.position.y, -maxMove), maxMove);
  }

  renderer.render(scene, camera);
}

//A listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

animate();
