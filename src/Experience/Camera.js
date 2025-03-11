import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.debug = this.experience.debug
        this.currentFov = 100
        if(this.debug.active)
            {
                this.debugFolder = this.debug.ui.addFolder('Camera')
                
            }
        this.setInstance()
        // this.setControls()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(100, this.sizes.width / this.sizes.height, 0.1, 100000000)
        this.instance.position.set(-180,40,10)
        // this.instance.layers.set(0)
        this.scene.add(this.instance)
        this.addDebugProp()
    }

    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }
    addDebugProp(){
        if(this.debugFolder){
        this.prop = {
            scale:0
        }
        this.debugFolder.add(this.instance.position, 'x').min(-1000).max(1000).step(0.01);
        this.debugFolder.add(this.instance.position, 'y').min(-1000).max(1000).step(0.01);
        this.debugFolder.add(this.instance.position, 'z').min(-1000).max(1000).step(0.01);
        this.debugFolder.close()
    }
     
    }
    setCameraLayer(layer=0){
        this.instance.layers.set(layer)
    }
    changeFov(fov){
        this.instance.fov = fov
        this.instance.updateProjectionMatrix()
    }
    updateFov(value){
        this.currentFov = value
        this.instance.fov=value 
        this.instance.updateProjectionMatrix()
    }
    resetFov(){
        this.instance.fov = this.currentFov;
        this.instance.updateProjectionMatrix()
    }
    update()
    {
        // this.controls.update()
    }
}