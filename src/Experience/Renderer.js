import * as THREE from 'three'
import Experience from './Experience.js'
import { ACESFilmicToneMapping } from 'three'

import EventEmitter from './Utils/EventEmitter.js';
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

        this.setInstance()
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
        this.instance.xr.enabled = true;
        this.instance.setAnimationLoop(()=> {

        //    this.update()
           this.trigger('tick')
        
        } );
    }
	
    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    update()
    {
        this.instance.render(this.scene, this.camera.instance)
    }
}