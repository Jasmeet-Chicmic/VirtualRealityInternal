import * as THREE from 'three'
import {PerspectiveCamera} from 'three'
import Experience from '../../Experience.js'
import { BoxGeometry } from 'three'
import { DoubleSide } from 'three'
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import { BackSide } from 'three'
export default class Museum
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camerasToIntersect = this.experience.camerasToIntersect
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.muesumModelMesh = null;
        this.firstCamera = null
        this.positionBoxMesh = null
    
        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('museum')
            
        }

        // Resource
        this.resource = this.resources.items.museum

        this.setModel()
        // this.setAnimation()
    }

    createDebugCameraIndicator(position,name){
        const box = new BoxGeometry(0.1,0.1,0.1)
        const material = new THREE.MeshBasicMaterial({ color: "red",transparent:true })
        const cube = new THREE.Mesh(box, material)
        
        cube.position.set(position.x, position.y, position.z)
        cube.name = name
        // cube.layers.enable(1)
        cube.renderOrder = 3
        this.positionBoxMesh = cube
        this.scene.add(cube)
        this.camerasToIntersect.push(cube)
    }
    setModel()
    {
      
       
        let scale = 0.02
        this.model = this.resource
        this.model.scale.set(scale,scale,scale)
        this.model.rotation.y = -Math.PI / 2
        
        this.scene.add(this.model)

        console.log("this,model",this.model);
        this.model.traverse((child) =>
        {
            
            if(child instanceof PerspectiveCamera){
           
                if(child.name.includes("0000")){
                this.firstCamera = child;
                   
                    
            }
                this.createDebugCameraIndicator(child.getWorldPosition(child.position),child.name);
            }
            if(child instanceof THREE.Mesh){
                // child.material.transparent = true;
                // child.material.opactiy = 0.1;
                child.material.transparent=true
                let helper = new VertexNormalsHelper( child, 1.0, 0xff0000, 1 );
                child.material.side = DoubleSide
                child.material.color.setHex(0x00ffff)
                child.layers.enable(1)
                child.colorWrite = false
                child.renderOrder = 2
                child.material.depthWrite = true

                // child.material.depthTest = true
                // child.material.blending = THREE.NormalBlending,
                this.experience.museumPartsToIntersect = child
                this.muesumModelMesh = child
                
                // child.material.depthWrite = false
                // child.material.depthTest = false
                console.log("childMaterial",child.material.transparent);
                
            }
        })
      this.addDebugProp()
        
    }

    addDebugProp(){
        if(this.debugFolder){
        this.prop = {
            scale:0
        }
        this.debugFolder.close()
        this.debugFolder.add(this.muesumModelMesh.position, 'x').min(-1000).max(1000).step(0.01);
        this.debugFolder.add(this.muesumModelMesh.position, 'y').min(-1000).max(1000).step(0.01);
        this.debugFolder.add(this.muesumModelMesh.position, 'z').min(-1000).max(1000).step(0.01);
        this.debugFolder.add(this.model.position, 'x').name("wholeX").min(-1000).max(1000).step(0.01);
        this.debugFolder.add(this.model.position, 'y').name("wholeY").min(-1000).max(1000).step(0.01);
        this.debugFolder.add(this.model.position, 'z').name("wholeZ").min(-1000).max(1000).step(0.01);
        this.debugFolder.add(this.muesumModelMesh.material, 'opacity').min(0).max(1).step(0.01);
        this.debugFolder.add(this.muesumModelMesh, 'visible').name("visible");
     
        this.debugFolder.add(this.prop,'scale').min(0.1).max(10).step(0.01).onChange(()=>{
            this.muesumModelMesh.scale.set(this.prop.scale,this.prop.scale,this.prop.scale)
        });
        this.debugFolder.add(this.muesumModelMesh,"renderOrder").name("MusuemRenderorder").min(0).max(10).step(1);
        this.debugFolder.add(this.positionBoxMesh,"renderOrder").name("positionBoxMesh").min(0).max(10).step(1);
    }
    }
    setAnimation()
    {
        this.animation = {}
        
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        
        // Actions
        this.animation.actions = {}
        
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[2])
        
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Play the action
        this.animation.play = (name) =>
        {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }

        // Debug
        if(this.debug.active)
        {
            const debugObject = {
                playIdle: () => { this.animation.play('idle') },
                playWalking: () => { this.animation.play('walking') },
                playRunning: () => { this.animation.play('running') }
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playWalking')
            this.debugFolder.add(debugObject, 'playRunning')
        
        }
    }

    update()
    {
        this.animation.mixer.update(this.time.delta * 0.001)
    }
}