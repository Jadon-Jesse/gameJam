import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// import RoboModel from './static/assets/models/RobotExpressive.glb'
// globals
var camera, scene, renderer, model;
var controls, clock;

// 3rd person camera
var goal, keys, follow;

var temp = new THREE.Vector3();
var dir = new THREE.Vector3();
var a = new THREE.Vector3();
var b = new THREE.Vector3();
var coronaSafetyDistance = 2;
var velocity = 0.0;
var speed = 0.0;

// animation setup
var mixer, actions, activeAction, previousAction;
var modelState = { state: 'Idle' };

var objects = [];
var environment = [];

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function setupTitleScreen() {
    // Inject HTML & CSS used for cover page
    var style = document.createElement('style');
    style.innerHTML = `#blocker {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    }
    #instructions {
        width: 100%;
        height: 100%;

        display: -webkit-box;
        display: -moz-box;
        display: box;

        -webkit-box-orient: horizontal;
        -moz-box-orient: horizontal;
        box-orient: horizontal;

        -webkit-box-pack: center;
        -moz-box-pack: center;
        box-pack: center;

        -webkit-box-align: center;
        -moz-box-align: center;
        box-align: center;

        color: #ffffff;
        text-align: center;
        font-family: Arial;
        font-size: 14px;
        line-height: 24px;

        cursor: pointer;
    }`;
    document.head.appendChild(style);

    var child = document.createElement('div');
    child.innerHTML = `<div id='blocker'>
        <div id='instructions'> 
            <span style="font-size:36px">Click to play</span>
            <br /><br />
            Move: W, S, A, D<br/>
            Jump: SPACE<br/>
            Look: MOUSE
        </div>
    </div>`;

    child = child.firstChild;

    document.body.appendChild(child);


}


function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(0, 1, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0xffffff, 0, 750);

    clock = new THREE.Clock();


    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    // light.position.set( 0.5, 1, 0.75 );
    scene.add(light);
    camera.lookAt(scene.position);

    // setup env
    var geometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2);
    var material = new THREE.MeshNormalMaterial();

    var mesh = new THREE.Mesh(geometry, material);

    var rand = Math.random;

    for (var x = 0; x < 10; x++) {
        for (var y = 0; y < 10; y++) {

            var clone = mesh.clone();

            clone.position.set(((x - 5) / 10) * 15, 0, (((y - 5) / 10) * 15) + 10);
            clone.scale.set(1 + rand() * 4, 1 + rand() * 2, 1 + rand() * 4);
            scene.add(clone);

            environment.push(clone);

        }
    }



    var loader = new GLTFLoader();
    loader.load('./assets/models/RobotExpressive.glb', function (gltf) {

        model = gltf.scene;

        goal = new THREE.Object3D();
        follow = new THREE.Object3D();
        follow.position.z = -coronaSafetyDistance;
        model.add(follow);

        model.scale.set(0.1, 0.1, 0.1);

        goal.add(camera);
        scene.add(model);


        setupModelAnimations(model, gltf.animations);


    }, undefined, function (e) {

        console.error(e);

    });





    var gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);

    scene.add(new THREE.AxesHelper());

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    keys = {
        a: false,
        s: false,
        d: false,
        w: false,
        space: false
    };

    document.body.addEventListener('keydown', function (e) {
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/repeat
        if (e.repeat) { return }

        // handle space bar
        if (e.code == "Space") {
            console.log("Space pressed");
            keys.space = true;

            fadeToAction("Jump", 0.2);
        }

        const key = e.code.replace('Key', '').toLowerCase();
        if (keys[key] !== undefined) {
            keys[key] = true;
            console.log("key pressed", key);

            if (keys.w === true || keys.s === true || keys.a === true || keys.d === true) {
                // if we are currently jumping
                if (keys.space === true) {
                    console.log("already jumping");
                }
                else {
                    console.log("walking");

                    // activeAction = actions['Walking'];
                    // activeAction.play();
                    fadeToAction("Walking", 0.2);

                }
            }
        }
        // console.log(e);








    });
    document.body.addEventListener('keyup', function (e) {

        // dont handle space bar on key release
        if (e.code == "Space") {
            console.log("Space left");
            keys.space = false;
            fadeToAction("Idle", 0.2);
        }

        const key = e.code.replace('Key', '').toLowerCase();
        if (keys[key] !== undefined) {

            keys[key] = false;

            console.log(keys);
            console.log("key unpressed", key);


            // if all nav keys unpressed then idle anim
            if (keys.w === false && keys.s === false && keys.a === false && keys.d === false) {
                console.log("stopping anim");
                fadeToAction("Idle", 0.2);
                // activeAction = actions['Idle'];
                // activeAction.play();
            }
        }



    });

}


function setupModelAnimations(model, animations) {
    var states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
    var emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

    mixer = new THREE.AnimationMixer(model);

    actions = {};

    for (var i = 0; i < animations.length; i++) {

        var clip = animations[i];
        var action = mixer.clipAction(clip);
        actions[clip.name] = action;

        if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {

            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;

        }

    }



    activeAction = actions['Idle'];
    activeAction.play();

}


function fadeToAction(name, duration) {

    previousAction = activeAction;
    activeAction = actions[name];

    if (previousAction !== activeAction) {

        previousAction.fadeOut(duration);

    }

    activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play();

}



function updateModelState() {

    if (keys.w === true || keys.s === true || keys.a === true || keys.d === true) {
        // if we are currently jumping
        if (keys.space === true) {
            // console.log("already jumping");
            modelState.state = "Jump"
        }
        else {
            console.log("walking");

            // activeAction = actions['Walking'];
            // activeAction.play();
            // fadeToAction("Walking", 0.2);
            modelState.state = "Walking"

        }
    }

}



function animate() {

    var dt = clock.getDelta();
    if (mixer) {
        mixer.update(dt);
    }


    requestAnimationFrame(animate);


    speed = 0.0;

    if (keys.w)
        speed = 0.01;
    else if (keys.s)
        speed = -0.01;

    velocity += (speed - velocity) * .3;
    model.translateZ(velocity);

    if (keys.a)
        model.rotateY(0.05);
    else if (keys.d)
        model.rotateY(-0.05);

    // the jump
    if (keys.space === true) {
        model.translateY(0.01);
    }
    else if (keys.space === false) {
        // some gravity to bring you down
        const g = 9.8;
        if (model.position.y > 0) {

            model.translateY(-0.01);
        }
    }



    a.lerp(model.position, 0.4);
    b.copy(goal.position);

    dir.copy(a).sub(b).normalize();
    const dis = a.distanceTo(b) - coronaSafetyDistance;
    goal.position.addScaledVector(dir, dis);
    goal.position.lerp(temp, 0.02);
    temp.setFromMatrixPosition(follow.matrixWorld);

    camera.lookAt(model.position);



    for (var i = 0; i < environment.length; i++) {
        var obj = environment[i];
        var modelObjDist = Distance(model, obj);
        if (modelObjDist < 0.5) {
            console.log("In range");
            console.log(modelObjDist);
            // console.log(obj);
            // var material = new THREE.MeshNormalMaterial();
            var newMat = new THREE.MeshPhongMaterial();
            obj.material = newMat;
            environment[i] = obj;
        }
    }


    renderer.render(scene, camera);

}

function Distance(value1, value2) {

    var Distance = Math.pow(Math.pow(value1.position.x - value2.position.x, 2) + Math.pow(value1.position.y - value2.position.y, 2) + Math.pow(value1.position.z - value2.position.z, 2), 0.5)

    return Distance;

}


function setup() {
    init();
    animate();
}

setup();