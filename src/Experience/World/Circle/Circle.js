import * as THREE from 'three'
import Experience from '../../Experience'


export default class Circle
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        this.geometry = new THREE.CircleGeometry(0.1, 32);
    }

    setTextures()
    {
        // this.textures = {}

        // this.textures.color = this.resources.items.grassColorTexture
        // this.textures.color.colorSpace = THREE.SRGBColorSpace
        // this.textures.color.repeat.set(1.5, 1.5)
        // this.textures.color.wrapS = THREE.RepeatWrapping
        // this.textures.color.wrapT = THREE.RepeatWrapping

        // this.textures.normal = this.resources.items.grassNormalTexture
        // this.textures.normal.repeat.set(1.5, 1.5)
        // this.textures.normal.wrapS = THREE.RepeatWrapping
        // this.textures.normal.wrapT = THREE.RepeatWrapping
    }

    setMaterial()
    {
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
    
        this.mesh.rotation.x = -Math.PI / 2;
        this.scene.add(this.mesh)
    }
}