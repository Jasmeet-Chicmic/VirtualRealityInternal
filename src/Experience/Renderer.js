import * as THREE from 'three'
import Experience from './Experience.js'
import { ACESFilmicToneMapping } from 'three'

import EventEmitter from './Utils/EventEmitter.js';
import { EVENTS } from '../Constants.js';
export default class Renderer extends EventEmitter
{
    constructor()
    {
        super()
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.vrStarted = false
        this.setInstance();
        
    }

    setInstance()
    {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })   
        this.instance.useLegacyLights = true;
        this.instance.toneMapping = ACESFilmicToneMapping;
        this.instance.toneMappingExposure = 0.5;
   
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setClearColor('#211d20')
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
        //For testing
        // this.instance.sortObjects = false
       
        this.instance.setAnimationLoop(()=> {

        //    this.update()
           this.trigger('tick')
        
        } );
        this.setXR()
    }
	setXR(){
        this.instance.xr.enabled = true;
        this.instance.xr.setReferenceSpaceType('local-floor'); 
        this.instance.xr.addEventListener('sessionstart', () => {
           
         this.trigger(EVENTS.XR_SESSION_START)
        this.vrStarted = true;
        });
    }
     updateXRCameraFoV(renderer, camera, targetFov = null) {
        const session = renderer.xr.getSession();
        
        if (session) {
            const cameraGroup = renderer.xr.getCamera(camera); // Get the WebXR camera group
    
            cameraGroup.cameras.forEach((xrCamera) => { // Loop through both eyes
                if (targetFov !== null) {
                    // Convert degrees to radians
                    const fovRad = THREE.MathUtils.degToRad(targetFov);
                    
                    // Get aspect ratio from XR camera
                    const viewport = renderer.getSize(new THREE.Vector2()); // Get current viewport size
                    const aspect = viewport.x / viewport.y; // XR camera aspect ratio
                    
                    const near = camera.near;
                    const far = camera.far;
    
                    // Compute new projection parameters
                    const top = Math.tan(fovRad / 2) * near;
                    const height = 2 * top;
                    const width = aspect * height;
                    const left = -width / 2;
    
                    // Create a new projection matrix
                    const newProjectionMatrix = new THREE.Matrix4();
                    newProjectionMatrix.set(
                        (2 * near) / width, 0, 0, 0,
                        0, (2 * near) / height, 0, 0,
                        0, 0, -(far + near) / (far - near), -1,
                        0, 0, (-2 * far * near) / (far - near), 0
                    );
    
                    // Apply the new projection matrix to both eyes
                    xrCamera.projectionMatrix.copy(newProjectionMatrix);
                }
            });
        }
    }
    
    
    
    
    
    destroy(){
        this.instance.xr.removeEventListener('sessionstart')
    }
    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    update()

    {
        // if(this.vrStarted)
        // {this.updateXRCameraFoV(this.instance, this.camera.instance,160) }
        this.instance.render(this.scene, this.camera.instance)
    }
}