// VRControls.js
import * as THREE from 'three';
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

export default class VRControls {
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;
        this.xrCamera = this.renderer.xr.getCamera();

        // Create a parent group for the VR scene
        this.vrGroup = new THREE.Group();
        this.vrGroup.add(this.scene);
        this.renderer.xr.getCamera().add(this.vrGroup); // Attach to camera

        this.initVR();
        this.setVRControls();
    }

    initVR() {
        document.body.appendChild(XRButton.createButton(this.renderer, {
            'optionalFeatures': ['depth-sensing'],
            'depthSensing': { 'usagePreference': ['gpu-optimized'], 'dataFormatPreference': [] }
        }));
    }

    setVRControls() {
        this.controller1 = this.renderer.xr.getController(0);
        this.controller2 = this.renderer.xr.getController(1);
        
        this.controller1.addEventListener('selectstart', this.onSelectStart);
        this.controller1.addEventListener('selectend', this.onSelectEnd);
        this.scene.add(this.controller1);
        
        this.controller2.addEventListener('selectstart', this.onSelectStart);
        this.controller2.addEventListener('selectend', this.onSelectEnd);
        this.scene.add(this.controller2);

        const controllerModelFactory = new XRControllerModelFactory();

        this.controllerGrip1 = this.renderer.xr.getControllerGrip(0);
        this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1));
        this.scene.add(this.controllerGrip1);

        this.controllerGrip2 = this.renderer.xr.getControllerGrip(1);
        this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2));
        this.scene.add(this.controllerGrip2);
        
        const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
        const line = new THREE.Line(geometry);
        line.name = 'line';
        line.scale.z = 5;
        
        this.controller1.add(line.clone());
        this.controller2.add(line.clone());
    }

    update() {
        if (this.renderer.xr.isPresenting) {
            const xrCamera = this.renderer.xr.getCamera();
            this.vrGroup.position.setFromMatrixPosition(xrCamera.matrixWorld);
            this.vrGroup.quaternion.setFromRotationMatrix(xrCamera.matrixWorld);
        }
    }

    onSelectStart(event) {
        console.log('onselect start');
    }

    onSelectEnd(event) {
        console.log('onselect end');
    }
}
