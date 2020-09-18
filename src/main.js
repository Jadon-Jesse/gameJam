import * as THREE from 'three';

// globals
var camera, scene, renderer;
var controls, clock;


function setupThreeJS() {
    // create the scene and setup camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 400;
    camera.position.z = 400;
    camera.rotation.x = -45 * Math.PI / 180;


    // Add basic lighting to the scene
    var light = new THREE.DirectionalLight(0xf6e86d, 1);
    light.position.set(0, 0, 1);
    camera.add(light);
    scene.add(camera);
    renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // setup clock which will be used for animation calcs
    clock = new THREE.Clock();

    // setup fps controls
    controls = new THREE.FirstPersonControls(camera);
    controls.movementSpeed = 100;
    controls.lookSpeed = 0.1;
}


function setupWorld() {
    // floor
    var geo = new THREE.PlaneGeometry(2000, 2000, 20, 20);
    var mat = new THREE.MeshBasicMaterial({ color: 0x9db3b5, overdraw: true });
    var floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -90 * Math.PI / 180;
    scene.add(floor);

    // original building
    var geometry = new THREE.CubeGeometry(1, 1, 1);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
    var material = new THREE.MeshPhongMaterial({ overdraw: true, color: 0xcccccc });

    // cloned buildings with random params
    for (var i = 0; i < 70; i++) {
        var building = new THREE.Mesh(geometry.clone(), material.clone());
        building.position.x = Math.floor(Math.random() * 200 - 100) * 4;
        building.position.z = Math.floor(Math.random() * 200 - 100) * 4;
        building.scale.x = Math.random() * 50 + 10;
        building.scale.y = Math.random() * building.scale.x * 8 + 8;
        building.scale.z = building.scale.x;
        scene.add(building);
    }
}


function setup() {
    document.body.style.backgroundColor = '#d7f0f7';
    setupThreeJS();
    setupWorld();
    requestAnimationFrame(function animate() {
        renderer.render(scene, camera);
        controls.update(clock.getDelta());
        requestAnimationFrame(animate);
    });
}


// setup everything
setup();