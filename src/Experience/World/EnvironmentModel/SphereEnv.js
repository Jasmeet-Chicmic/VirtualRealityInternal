import * as THREE from 'three'
import Experience from '../../Experience'
import gsap from 'gsap'

export default class SphereEnv {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.textures = [] // Dynamic texture queue
        this.currentTexture = null
        this.loadingTexture = null
        if(this.debug.active)
            {
                this.debugFolder = this.debug.ui.addFolder('Sphere')
               
            }
        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry() {
        this.geometry = new THREE.SphereGeometry(60, 64, 64)
    }

    setMaterial() {
        this.material = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            transparent: true,
            opacity: 1
        })
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        // this.mesh.position.copy(this.experience.camera.instance.position)
        this.mesh.layers.set(0) // Render after the skybox
        this.scene.add(this.mesh)
        let value = 0
            this.changeTexture(`textures/environmentMap/MuseumEnv/360_test_000${value++%2}.jpeg`)
        
        this.addDebugProp()
        // setInterval(()=>{
        //     this.changeTexture(`textures/environmentMap/MuseumEnv/360_test_000${value++%2}.jpeg`)
        // },10000)
    }
    addDebugProp(){
        if(this.debugFolder){
        this.debugFolder.add(this.mesh.position, 'x').min(-1000).max(1000).step(2) 
        this.debugFolder.add(this.mesh.position, 'y').min(-1000).max(1000).step(1);
        this.debugFolder.add(this.mesh.position, 'z').min(-1000).max(1000).step(1);
       
        this.debugFolder.add(this.material, 'opacity').min(0).max(1).step(0.01);}
    }

    /**
     * Loads a texture dynamically from a given URL and applies the transition
     */
    async changeTexture(textureUrl) {
        // Load new texture dynamically
        const newTexture = await this.loadTexture(textureUrl)
        // newTexture.flipY = false;
        // newTexture.flipX = false;
        // If no current texture, just apply and return
        if (!this.currentTexture) {
            this.applyTexture(newTexture)
            return
        }

        // Move camera forward slightly for a "moving effect"
        const camera = this.experience.camera.instance
        const moveForward = new THREE.Vector3(0, 0, -5).applyQuaternion(camera.quaternion)

        // Transition animation
        gsap.to(this.mesh.scale, {
            x: 1.2, y: 1.2, z: 1.2, // Simulating forward motion
            duration: 1.5,
            ease: 'power2.out'
        })

        gsap.to(this.material, {
            opacity: 0,
            duration: 1.5,
            ease: 'power2.out',
            onComplete: () => {
                this.applyTexture(newTexture)
                this.mesh.scale.set(1, 1, 1) // Reset scale
            }
        })

        // gsap.to(camera.position, {
        //     x: camera.position.x + moveForward.x,
        //     y: camera.position.y + moveForward.y,
        //     z: camera.position.z + moveForward.z,
        //     duration: 1.5,
        //     ease: 'power2.out'
        // })
    }

    /**
     * Applies a new texture to the sphere
     */
    applyTexture(newTexture) {
        this.material.map = newTexture
        this.material.opacity = 1
        this.material.needsUpdate = true
        this.currentTexture = newTexture
    }

    /**
     * Dynamically loads a texture from a URL
     */
    loadTexture(url) {
        return new Promise((resolve) => {
            const loader = new THREE.TextureLoader()
            loader.load(url, (texture) => {
                texture.needsUpdate = true
                resolve(texture)
            })
        })
    }
}
