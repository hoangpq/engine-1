const Atlas = require('./atlas');

let _atlases = [];
let _atlasIndex = -1;

let _maxAtlasCount = 5;
let _textureSize = 2048;
let _maxFrameSize = 512;

let _enabled = false;

let _debugNode = null;

function newAtlas () {
    let atlas = new Atlas(_textureSize, _textureSize);
    _atlases.push(atlas);
    _atlasIndex++;
    return atlas;
}


/**
 * !#en Manager the dynamic atlas.
 * !#zh 管理动态图集。
 * @class DynamicAtlasManager
 */
let dynamicAtlasManager = {
    
    /**
     * !#en Enabled or Disabled dynamic atlas.
     * !#zh 开启或者关闭动态图集。
     * @property enabled
     * @type {Boolean}
     */
    get enabled () {
        return _enabled;
    },
    set enabled (value) {
        if (_enabled === value) return;

        if (value) {
            this.reset();
        }
        _enabled = value;
    },

    /**
     * !#en The maximum number of atlas that can be created.
     * !#zh 可以创建的最大图集数量。
     * @property maxAtlasCount
     * @type {Number}
     */
    get maxAtlasCount () {
        return _maxAtlasCount;
    },
    set maxAtlasCount (value) {
        _maxAtlasCount = value;
    },

    /**
     * !#en The size of the atlas that was created
     * !#zh 创建的图集的宽高
     * @property textureSize
     * @type {Number}
     */
    get textureSize () {
        return _textureSize;
    },
    set textureSize (value) {
        _textureSize = value;
    },

    /**
     * !#en The maximum size of the picture that can be added to the atlas.
     * !#zh 可以添加进图集的图片的最大尺寸。
     * @property maxFrameSize
     * @type {Number}
     */
    get maxFrameSize () {
        return _maxFrameSize;
    },
    set maxFrameSize (value) {
        _maxFrameSize = value;
    },

    /**
     * !#en Append a sprite frame into the dynamic atlas.
     * !#zh 添加碎图进入动态图集。
     * @method insertSpriteFrame
     * @param {SpriteFrame} spriteFrame 
     */
    insertSpriteFrame (spriteFrame) {
        if (CC_EDITOR) return;
        if (!this.enabled || _atlasIndex === _maxAtlasCount ||
            !spriteFrame || spriteFrame._oriInfo) return;
        
        let texture = spriteFrame._texture;
        if (texture.width > _maxFrameSize || texture.height > _maxFrameSize) {
            return;
        }

        let atlas = _atlases[_atlasIndex];
        if (!atlas) {
            atlas = newAtlas();
        }

        if (!atlas.insertSpriteFrame(spriteFrame) && _atlasIndex !== _maxAtlasCount) {
            atlas = newAtlas();
            atlas.insertSpriteFrame(spriteFrame);
        }
    },

    /** 
     * !#en Resets all dynamic atlas, and the existing ones are not destroyed, but are reused.
     * !#zh 重置所有动态图集，已有的动态图集并不会被销毁，而是会被复用。
     * @method reset
    */
    reset () {
        for (let i = 0; i <= _atlasIndex; i++) {
            _atlases[i].reset();
        }
        _atlasIndex = -1;
    },

    /** 
     * !#en Releases all dynamic atlas, which are destroyed.
     * !#zh 释放所有动态图集，这些图集会被销毁掉。
     * @method releaseAll
    */
    releaseAll () {
        for (let i = 0, l = _atlases.length; i < l; i++) {
            _atlases[i].destroy();
        }
        _atlases.length = 0;
        _atlasIndex = -1;
    },

    /**
     * !#en Displays all the dynamic atlas in the current scene, which you can use to view the current atlas state.
     * !#zh 在当前场景中显示所有动态图集，可以用来查看当前的合图状态。
     * @method showDebug
     * @param {Boolean} show
     */
    showDebug: CC_DEV && function (show) {
        if (show) {
            if (!_debugNode) {
                let width = cc.visibleRect.width;
                let height = cc.visibleRect.height;

                _debugNode = new cc.Node('DYNAMIC_ATLAS_DEBUG_NODE');
                _debugNode.width = width;
                _debugNode.height = height;
                _debugNode.x = width/2;
                _debugNode.y = height/2;
                _debugNode._zIndex = cc.macro.MAX_ZINDEX;
                _debugNode.parent = cc.director.getScene();

                let scroll = _debugNode.addComponent(cc.ScrollView);

                let content = new cc.Node('CONTENT');
                let layout = content.addComponent(cc.Layout);
                layout.type = cc.Layout.Type.VERTICAL;
                layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
                content.parent = _debugNode;

                for (let i = 0; i <= _atlasIndex; i++) {
                    let node = new cc.Node('ATLAS');
                    
                    let texture = _atlases[i]._texture;
                    let spriteFrame = new cc.SpriteFrame();
                    spriteFrame.setTexture(_atlases[i]._texture);

                    let sprite = node.addComponent(cc.Sprite)
                    sprite.spriteFrame = spriteFrame;
                    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

                    node.width = height;
                    node.height = height;

                    node.parent = content;
                }
            }
        }
        else {
            if (_debugNode) {
                _debugNode.parent = null;
                _debugNode = null;
            }
        }
    },

    update () {
        if (!this.enabled) return;

        for (let i = 0; i <= _atlasIndex; i++) {
            _atlases[i].update();
        }
    },
};

/**
 * @module cc
 */

/**
 * @property dynamicAtlasManager
 * @type DynamicAtlasManager
 */
module.exports = cc.dynamicAtlasManager = dynamicAtlasManager;