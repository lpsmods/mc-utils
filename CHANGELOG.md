# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.6] (Pre-release) - 10/30/2025

### General

- Updated for @minecraft/server 2.3.0
- Removed pottable item component and potted flower block component. (Use `minecraft:flower_pottable` block component)
- Chunk.isLoaded now uses isChunkLoaded
- All instances of Hasher.stringify(Vector3) and Hasher.parseVec3 now use Vector3Utils.toString and Vector3Utils.fromString

### Components

- Added FoodComponent
- Changed CakeComponent
  - Now plays the burp sound.
  - Added saturation_modifier option.

### Fixes

- DataUtils.load how returns the JSON instead of the store value.

### API

- Added ScreenEvents
- Added ScreenEventSource
- Added ScreenEventOptions
- Added ScreenEvent
- Added OpenScreenEvent
- Added CloseScreenEvent
- Removed Biome
- Removed BIOME_MAP
- Removed PottableOptions
- Removed PottableComponent
- Added DirectionUtils
- Removed constant UP
- Removed constant DOWN
- Removed constant NORTH
- Removed constant EAST
- Removed constant SOUTH
- Removed constant WEST
- Added constant BLACK
- Added constant WHITE
- Added constant RED
- Added constant GREEN
- Added constant BLUE
- Added GuideBookEntity
- Added GuideBookEntityOptions
- Added GuideBookEntityEvent
- Added TurnPageEntityEvent
- Added DataEvent
- Added ReadDataEvent
- Added WriteDataEvent
- Added DeleteDataEvent
- Added ReadDataEventSignal
- Added WriteDataEventSignal
- Added DeleteDataEventSignal
- Added DataStorageEvents
- Changed PlayerUtils
  - Added function eat
  - Added function canEat
- Changed FeatureHandler
  - Removed parameter biomeMap
  - Removed parameter biomeEntityId
  - Removed parameter biomePropertyName
- Changed WorldUtils
  - Removed function biome2Name
  - Removed function getBiome
  - Removed function rot2dir
  - Removed function num2dir
  - Removed function rotateYCounterclockwise
  - Removed function relDir
  - Removed function getOpposite
  - Removed function dir2Axis
  - Removed function dir2Offset
  - Removed function dir2Rot
  - Removed function offsetFromDirection
- Changed MathUtils
  - Removed function distanceFromPoints
- Changed DataStorage
  - Added function pop
  - Added function push
  - Added function filter
  - Added function some
  - Added function every
  - Added function find
  - Added function onRead
  - Added function onWrite

## [0.0.5] (Pre-release) - 10/9/2025

### General

- Added frameworks for custom status effects and enchantments.
- Custom commands now use classes instead of functions and properties.
- Added custom block and item tags.
- `WorldUtils.getBiome` caches biomes.

### Fixes

- `movedTick` or `entityTick` no longer throws `LocationOutOfWorldBoundariesError`
- `EntityLootHandler` no longer throws `InvalidActorError`

### API

- Added AreaDetectorOptions
- Added ChunkUtils
- Added ChunkVolume
- Added CustomBlockTags
- Added CustomCommandUtils
- Added CustomEffect
- Added CustomEffectCommand
- Added CustomEffectUtils
- Added CustomEffectUtilsOptions
- Added CustomEffects
- Added CustomEnchantCommand
- Added CustomEnchantment
- Added CustomEnchantmentInstance
- Added CustomEnchantmentUtils
- Added CustomEnchantments
- Added CustomFeature
- Added CustomFeatureOptions
- Added CustomFeatureRule
- Added CustomFeatureRuleOptions
- Added CustomItemTags
- Added CustomTagRegistry
- Added CustomTags
- Added DataUtils
- Added FlattenableBlockRegistry
- Added FlattenableOptions
- Added Gateway
- Added GatewayAreaDetector
- Added HostSettingsPage
- Added OxidizableBlocksRegistry
- Added OxidizableOptions
- Added PlaceCommand
- Added PlayerChunkTickEventSignal
- Added PlayerSettingsPage
- Added Registry
- Added RenderJsonOptions
- Added ShearableBlocksRegistry
- Added ShearableOptions
- Added StrippableBlockRegistry
- Added StrippableBlockRegistry
- Added StrippableOptions
- Added TestCommand
- Added TillableBlockOptions
- Added TillableBlockRegistry
- Added VersionedDataSchema
- Added VersionedDataStorage
- Added WaxableBlockOptions
- Added WaxableBlockRegistry
- Added property customEffectRegistry
- Added property customEnchantmentRegistry
- Added property flattenableBlocks
- Added property oxidizableBlocks
- Added property shearableBlocks
- Added property strippableBlocks
- Added property tillableBlocks
- Added property waxableBlocks
- Added UnionShape
- Remove function executePlaceCommand
- Remove function executeTestCommand
- Remove property placeCommand
- Remove property testCommand
- Removed Feature
- Removed FeatureOptions
- Removed FeatureRule
- Removed FeatureRuleOptions
- Removed RenderJSONOptions
- Removed function locationToChunk
- Renamed Arrow to ArrowShape
- Renamed Box to BoxShape
- Renamed Circle to CircleShape
- Renamed Cone to ConeShape
- Renamed Cylinder to CylinderShape
- Renamed Dodecahedron to DodecahedronShape
- Renamed Edges to EdgesShape
- Renamed Extrude to ExtrudeShape
- Renamed Icosahedron to IcosahedronShape
- Renamed Lathe to LatheShape
- Renamed Line to LineShape
- Renamed Octahedron to OctahedronShape
- Renamed Plane to PlaneShape
- Renamed Polyhedron to PolyhedronShape
- Renamed Ring to RingShape
- Renamed Sphere to SphereShape
- Renamed Tetrahedron to TetrahedronShape
- Renamed Text to TextShape
- Renamed Torus to TorusShape
- Renamed TorusKnot to TorusKnotShape
- Renamed Tube to TubeShape
- Renamed Wireframe to WireframeShape
- Changed Shape
  - Renamed typeId to shapeId
- Changed AreaEvent
  - Added property dimension
- Changed RandomUtils
  - Added function posInVolume
- Changed Ticking
  - Added property enabled
- Changed AreaDetector
  - Added function isIn
  - Added function isLoaded
  - Added function getBlockVolume
  - Added function getChunkVolume
  - Removed parameter dimensionId
  - Removed parameter prefix
  - Removed parameter id
  - Removed parameter tickInterval
  - Added parameter options
- Changed MathUtils
  - Added function combineBlockVolumes
- Changed WorldUtils
  - Added function rot2dir
  - Added function chunkVolume
  - Added function fillBlocks
- Changed EntityUtils
  - Added function getFacingDirection
  - Added function removeAll
- Changed ItemUtils
  - Added function clear
  - Added function enchant
  - Added function holding
  - Removed isAxe
  - Removed isHolding
  - Removed holdingAxe
  - Removed isIgnitable
  - Removed hasIgnitable
- Changed WorldSettings
  - Added function show
- Changed PlayerSettings
  - Added function show
- Changed BlockUtils
  - Changed setType
    - Added argument excludeStates
- Changed Identifier
  - Added function string
- Changed Chunk
  - Removed getMatrix
  - Removed fromPos
  - Removed fromBlock
  - Removed fromEntity
  - Removed getVolume
  - Added getBlockVolume

## [0.0.4] (Pre-release) - 9/22/2025

### Fixes

- Fixed import error in paged_action_form.ts

## [0.0.3] (Pre-release) - 9/18/2025

### General

- AttackUtils now uses the entityAttack damage cause.
- Area detectors now use a dimensionId instead of Dimension.
- Handlers now only subscribe to events if it has been initialized.
- Improved ChunkEvents tick performance.
- `typeId` for all block and item components has been changed to `componentId`.
- Components now validate parameters
- Added function runAllTests
- Added EntityUtils
- Added ViscosityComponent
- Added WorldSettings
- Added PlayerSettings
- Added TileEntityHandler
- Added TileEntityEvent
- Added TileEntityTickEvent
- Added PagedActionForm
- Added PagedActionFormOptions
- Added TileEntityComponent
- Added TileEntityOptions
- Added PagedActionFormEvent
- Added SphereAreaDetector
- Added RectangleAreaDetector
- Removed RadiusDetector
- Removed RectDetector
- Removed WoodenButtonComponent
- Removed StoneButtonComponent
- Removed InfoBookEvent
- Removed WoodenPressurePlateComponent
- Removed StonePressurePlateComponent
- Removed LightWeightedPressurePlateComponent
- Removed HeavyWeightedPressurePlateComponent
- Changed AreaEvents
  - Removed property enter
  - Removed property leave
  - Removed property tick
  - Added property entityEnter
  - Added property entityLeave
  - Added property entityTick
- Changed BlockEvents
  - Removed property enter
  - Removed property leave
  - Removed property inBlockTick
- Changed ItemEvents
  - Removed property hold
  - Removed property releaseHold
  - Removed property holdTick
  - Added property playerHold
  - Added property playerReleaseHold
  - Added property playerHoldTick
- Changed BlockUtils
  - Added matches
- Changed ItemUtils
  - Added matches
- Changed SearchPage
  - Removed property typeId
  - Added property pageId
- Changed EntityUtils
  - Added property dropAll
- Changed PlayerHandler
  - Added function onBreakBlock
  - Added function onBeforeBreakBlock
  - Added function onButtonInput
  - Added function onDimensionChange
  - Added function onEmote
  - Added function onGameModeChange
  - Added function onBeforeGameModeChange
  - Added function onHotbarSelectedSlotChange
  - Added function onInputModeChange
  - Added function onInputPermissionCategoryChange
  - Added function onInteractWithBlock
  - Added function onBeforeInteractWithBlock
  - Added function onInteractWithEntity
  - Added function onBeforeInteractWithEntity
  - Added function onInventoryItemChange
  - Added function onJoin
  - Added function onLeave
  - Added function onPlaceBlock
  - Added function onPlayerSpawn
- Changed EntityMovedEvent
  - Added property movedBlock
  - Added property movedChunk
- Changed EntityEvents
  - Added property entityEnter
  - Added property entityLeave
  - Added property entityInBlockTick
- Changed EntityHandler
  - Added onBeforeInteract
  - Removed property playerInventoryChanged
  - Removed function onPlayerInteract
  - Added function onInteract
  - Removed function remove
  - Added function delete
  - Added removeAll
  - Added getEntities
- Changed ChunkEvents
  - Removed property load
  - Added property playerLoad
  - Removed property unload
  - Added property playerUnload
  - Removed property tick
  - Added property playerLoadedTick
- Changed LootTableHandler
  - Removed function drop
  - Added function generate

### Fixes

- package.main now points to src/index.ts
- Chunk.z now returns the z location instead of the x.

### Components

- FarmlandComponent
  - uses onRandomTick instead of onTick.
- FenceGateComponent
  - Detects walls.
  - Extends the Toggleable component.
- ToggleableComponent
  - Renamed `state` param to `toggle_state`

## [0.0.1] (Pre-release) - 9/2/2025

- Initial release
