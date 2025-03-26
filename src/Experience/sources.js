export default [
    {
        name: 'environmentMapTexture',
        type: 'cubeTexture',
        path:
        [
            'textures/environmentMap/px.jpg',
            'textures/environmentMap/nx.jpg',
            'textures/environmentMap/py.jpg',
            'textures/environmentMap/ny.jpg',
            'textures/environmentMap/pz.jpg',
            'textures/environmentMap/nz.jpg'
        ]
    },
    {
        name: 'grassColorTexture',
        type: 'texture',
        path: 'textures/dirt/color.jpg'
    },
    {
        name: 'playIcon',
        type: 'texture',
        path: 'textures/interactiveTexture/play.png'
    },
    {
        name: 'pauseIcon',
        type: 'texture',
        path: 'textures/interactiveTexture/pause.png'
    },
    {
        name: 'grassNormalTexture',
        type: 'texture',
        path: 'textures/dirt/normal.jpg'
    },
    {
        name: 'MuseumEnv',
        type: 'texture',
        path: 'textures/environmentMap/MuseumEnv/360_test_0000.jpeg'
    },
    {
        name: 'Indicator',
        type: 'texture',
        path: 'textures/indicators/indicator.png'
    },
    {
        name: 'StaticIndicator',
        type: 'texture',
        path: 'textures/indicators/staticIndicator.png'
    },
    {
        name: 'NewMuseumEnv',
        type: 'texture',
        path: 'textures/environmentMap/MuseumEnv/360_test_0001.jpeg'
    },
    {
        name: 'foxModel',
        type: 'gltfModel',
        path: 'models/Fox/glTF/Fox.gltf'
    },
    {
        name:'museum',
        type:"fbx",
        path:'models/Museum/Museum_Model_new.fbx'
    }
]


export const UI_PATHS = {
    INITIAL_SCREEN : "./2d/initialScreen/initialScreen.png"
}