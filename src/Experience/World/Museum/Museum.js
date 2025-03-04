import * as THREE from 'three'
import {PerspectiveCamera} from 'three'
import Experience from '../../Experience.js'
import { BoxGeometry } from 'three'

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
        const material = new THREE.MeshBasicMaterial({ color: "red" })
        const cube = new THREE.Mesh(box, material)
        cube.position.set(position.x, position.y, position.z)
        cube.name = name
        this.scene.add(cube)
        this.camerasToIntersect.push(cube)
    }
    setModel()
    {
        this.model = this.resource
        this.model.scale.set(0.02, 0.02, 0.02)
        this.scene.add(this.model)

        this.model.traverse((child) =>
        {
            if(child instanceof PerspectiveCamera){
           
                
                this.createDebugCameraIndicator(child.getWorldPosition(child.position),child.name);
            }
        })
      
        
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