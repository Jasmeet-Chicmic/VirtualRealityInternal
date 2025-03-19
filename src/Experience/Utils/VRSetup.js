// VRControls.js
import * as THREE from 'three';
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import Experience from '../Experience';

export default class VRControls {
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;
        this.experience = new Experience()
        this.xrCamera = this.renderer.xr.getCamera();

        // Create a parent group for the VR scene
        this.vrGroup = new THREE.Group();
        this.vrGroup.add(this.scene);
        this.renderer.xr.getCamera().add(this.vrGroup); // Attach to camera
        this.intersectedCamera = []
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
        
        this.controller1.addEventListener('selectstart', ()=>this.onSelectStart());
        this.controller1.addEventListener('selectend', ()=>this.onSelectEnd());
        this.experience.camera.cameraGroup.add(this.controller1);
        this.controller1.addEventListener('move', ()=>{this.getIntersections()})
        this.controller2.addEventListener('selectstart', ()=>this.onSelectStart());
        this.controller2.addEventListener('selectend', ()=>this.onSelectEnd());
        this.experience.camera.cameraGroup.add(this.controller2);

        const controllerModelFactory = new XRControllerModelFactory();

        this.controllerGrip1 = this.renderer.xr.getControllerGrip(0);
        this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1));
        this.experience.camera.cameraGroup.add(this.controllerGrip1);
        
        this.controllerGrip2 = this.renderer.xr.getControllerGrip(1);
        this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2));
        this.experience.camera.cameraGroup.add(this.controllerGrip2);
        
        const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
        const line = new THREE.Line(geometry);
        line.name = 'line';
        line.scale.z = 80;
        
        this.controller1.add(line.clone());
        this.controller2.add(line.clone());
    }
     getIntersections( ) {
      
        
        this.controller2.updateMatrixWorld();

        this.experience.raycaster.setFromXRController( this.controller2 );
        this.intersectedCamera = this.experience.raycaster.intersectObjects( this.experience.camerasToIntersect );
       this.intersectedModel = this.experience.raycaster.intersectObject( this.experience.museumPartsToIntersect );
        this.experience.world.intersectionObj.setIndicatorHoverColor(this.intersectedCamera)
        this.experience.world.intersectionObj.setCirclePos(this.intersectedModel)
       
        
         

    }
    update() {
        if (this.renderer.xr.isPresenting) {
            // const xrCamera = this.renderer.xr.getCamera();
            // this.vrGroup.position.setFromMatrixPosition(xrCamera.matrixWorld);
            // this.vrGroup.quaternion.setFromRotationMatrix(xrCamera.matrixWorld);
           
            // this.getIntersections(this.controller2)
        }
    }
    isPresenting(){
        return this.renderer.xr.isPresenting;
    }
    onSelectStart(event) {
        
        
        if(this.intersectedCamera.length>0){
           
        this.experience.world.intersectionObj.moveCameraForVR(this.intersectedCamera[0].object,this.intersectedCamera[0].object.position);}
        console.log('onselect start');
    }

    onSelectEnd(event) {
        console.log('onselect end');
    }
}
