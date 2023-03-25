/*可調整參數*/
let degree = 2 // 1簡單 2普通 3困難

/****************** 遊 戲 說 明 【深海探險】 ******************/

// 點擊畫面角色會往該處移動 & 遊戲會定速往下移動
// 收集氧氣 (氣泡)、道具前往更深處 (氧氣=生命，會隨時間減少)
// 途中可收集古物 (遊戲計分道具)、越深處獎勵越好
// 海洋生物會造成阻礙，閃避他們
// 結束條件：氧氣用光或碰到鯊魚

/*************************************************************/

//遊戲參數宣告
let timer, depth, score, playerSpeed, ctrlX, ctrlY, life, gameSpeed, invincible, death, isInk, gameStart, seafood, items, pointerX, pointerY, reverse, collection
function init() {
  timer = {
    speed : 0,
    life : 0,
    enemy : 0,
    award : 0
  }
  depth = 0 //下潛深度
  score = 0 //遊戲分數 = 下潛深度+戰利品
  playerSpeed = 4 //玩家移動速度
  life = 3 //初始氣泡數 上限8
  gameSpeed = 15 //遊戲初始下降速度
  invincible = 0 //無敵狀態
  death = false //遊戲結束判定
  isInk = false //墨魚動畫控制
  reverse = false //水滴魚鏡向操作
  gameStart = false
  seafood = [ //妨礙玩家的海鮮
    "pufferfish",
    "eel"
  ]
  items = [ //強化道具與戰利品
    "bubble",
    "bubble",
    "antique",
    "antique",
    "star"
  ]
  collection = []
  pointerX = 225 //點擊x座標 初始值為玩家初始x座標
  pointerY = 200 //點擊y座標 初始值為玩家初始y座標
}
const antiqueScore = {
  antique : 50,
  antique2 : 200,
  antique3 : 450
}
//文字物件
let startText
let depthText
let scoreText

//遊戲物件
let player
let position
let bg
let shine
let ink
let lifes
let enemy
let enemies = []
let award
let awards = []

//音效
let pushBtn
let pickItem
let superStar
let hurt
let paralyze
let dive
let eat
let darkness

//前導故事&教學
let gameStory
let tutorial

//UI&按鈕
let O2bar
let particle
let particles = []
let particleTimer = 0

class boot extends Phaser.Scene {
  constructor() {
      super('boot')
  }
  preload() {
    init()
      this.load.image('loading', './assets/preloader.gif')
      this.load.image('dauchung', './assets/dauchung.png')
  }
  create() {
      this.scene.start('load')
  }
}

class load extends Phaser.Scene {
  constructor() {
      super('load')
  }
  // Phaser 3 - loadingbar
  setPreloadSprite(sprite) {
      this.preloadSprite = { sprite: sprite, width: sprite.width, height: sprite.height }
      this.load.on('progress', this.onProgress, this)
  }
  onProgress(value) {
      if (this.preloadSprite) {
          let w = Math.floor(this.preloadSprite.width * value)
          this.preloadSprite.sprite.frame.width = (w <= 0 ? 1 : w)
          this.preloadSprite.sprite.frame.cutWidth = w
          // 更新紋理
          this.preloadSprite.sprite.frame.updateUVs()
      }
  }
  preload() {
    this.loadingbar = this.add.sprite(game.config.width / 2, game.config.height * 0.65, 'loading')
    this.setPreloadSprite(this.loadingbar)
    this.add.sprite(game.config.width / 2, game.config.height * 0.4, 'dauchung')

    this.load.spritesheet('bg', './assets/bg.png', {frameWidth: 450, frameHeight: 800})
    this.load.image('UIbar', './assets/UIbar.png')
    this.load.image('O2bar', './assets/O2bar.png')
    this.load.spritesheet('shine', './assets/shine.png', {frameWidth: 450, frameHeight: 533})
    this.load.spritesheet('ink', './assets/ink.png', {frameWidth: 450, frameHeight: 800})
    this.load.spritesheet('player', './assets/player.png', {frameWidth: 54, frameHeight: 62})
    this.load.image('position', './assets/position.png')
    this.load.image('bubble', './assets/bubble.png')
    this.load.image('antique', './assets/antique.png')
    this.load.image('antique2', './assets/antique2.png')
    this.load.image('antique3', './assets/antique3.png')
    this.load.image('star', './assets/star.png')
    this.load.spritesheet('pufferfish', './assets/pufferfish.png', {frameWidth: 58, frameHeight: 50})
    this.load.spritesheet('eel', './assets/eel.png', {frameWidth: 152, frameHeight: 69})
    this.load.spritesheet('cuttlefish', './assets/cuttlefish.png', {frameWidth: 120, frameHeight: 145})
    this.load.spritesheet('shark', './assets/shark.png', {frameWidth: 278, frameHeight: 93})
    this.load.image('blobfish', './assets/blobfish.png')

    //音樂音效
    this.load.audio('bgm', './assets/audio/qiuet-melody.mp3')
    this.load.audio('water_land', './assets/audio/water_land.mp3')
    this.load.audio('superStar', './assets/audio/angel_crying.mp3')
    this.load.audio('pushBtn', './assets/audio/pushBtn.m4a')
    this.load.audio('pickItem', './assets/audio/pickItem.m4a')
    this.load.audio('hurt', './assets/audio/hurt.m4a')
    this.load.audio('paralyze', './assets/audio/paralyze.m4a')
    this.load.audio('dive', './assets/audio/dive.m4a')
    this.load.audio('eat', './assets/audio/eat.m4a')
    this.load.audio('darkness', './assets/audio/darkness.m4a')
    
    //畫面UI
    this.load.image("scorePad", "./assets/scorePad.png")
    this.load.spritesheet('particle', './assets/particle.png', {frameWidth: 18, frameHeight: 39})
    this.load.image('tutorial', './assets/tutorial.png')
    this.load.image('startBtn', './assets/startBtn.png')
    this.load.image('skipBtn', './assets/skipBtn.png')
    this.load.image('againBtn', './assets/againBtn.png')
    this.load.image('exitBtn', './assets/exitBtn.png')
    
  }
  create() {
    //背景音樂
    const bgm = this.sound.add('bgm', {
      volume: 0.5,
      loop: true
    })
    const water_land = this.sound.add('water_land', {
      volume: 0.2,
      loop: true
    })
    bgm.play()
    water_land.play()
    this.scene.start('menu')
  }
}

class menu extends Phaser.Scene {
  constructor() {
    super('menu')
  }
  create() {
    bg = this.add.sprite(0, 0, 'bg').setOrigin(0, 0)
    player = this.add.sprite(225, 200, 'player')
    shine = this.add.sprite(0, 0, 'shine').setOrigin(0, 0)
    pushBtn = this.sound.add('pushBtn')
    this.anims.create({
      key: 'bg',
      frames: this.anims.generateFrameNumbers('bg', { frames: [0,1,2,1] } ),
      frameRate: 2,
      repeat: -1
    })
    this.anims.create({
      key: 'shine',
      frames: this.anims.generateFrameNumbers('shine', { start: 0, end: 7 }),
      frameRate: 4,
      repeat: -1
    })
    this.anims.create({
      key: 'playerNormal',
      frames: this.anims.generateFrameNumbers('player', { end: 3 }),
      frameRate: 4,
      repeat: -1
    })
    player.play('playerNormal', true)
    bg.play('bg', true)
    shine.play('shine', true)

    particles = this.add.group()

    this.add.text(20,780,"♫BGM:qiuet-melody by valentinsosnitskiy")

    this.add.image(this.scale.width * 0.5, this.scale.height * 0.5-100, 'startBtn').setOrigin(0.5, 0.5)
      .setInteractive().on('pointerup', function () {
        pushBtn.play()
        this.scene.scene.start('story')
      })
  }
  update() {
    particleTimer++
    while( particleTimer > 50 ){
      particle = this.physics.add.sprite(Phaser.Math.Between(0, 450),Phaser.Math.Between(800, 850), "particle", Phaser.Math.Between(0, 2))
      particles.add(particle)
      particle.body.setVelocityY( Phaser.Math.Between(-200, -450) )
      particleTimer = 0
    }
    //回收氣泡粒子
    particles.getChildren().forEach((el) => {
      if (el.y < 0) {
        el.destroy()
      }
    })
  }
}

class story extends Phaser.Scene {
  constructor() {
    super('story')
  }
  create() {
    tutorial = this.add.image(0, 0, 'tutorial').setOrigin(0).setInteractive()
    tutorial.on('pointerdown', function() {
      this.scene.scene.start('play')
    })
    this.add.image(this.scale.width-15 , 15, 'skipBtn').setOrigin(1, 0)
      .setInteractive().on('pointerup', function () {
        this.scene.scene.start('play')
      })
  }
}

class play extends Phaser.Scene {
    constructor() {
      super('play')
    }
    create() {
      const x = this.scale.width * 0.5
      const y = this.scale.height * 0.5
      //背景元素
      bg = this.add.sprite(450, 800, 'bg').setOrigin(1, 1)
      bg.play('bg', true)
      //玩家      
      player = this.physics.add.sprite(x, 200, 'player')
      player.setCollideWorldBounds(true).body.setSize(50, 50, 0.5, 0.5)
      player.body.immovable = true
      player.setImmovable(true)
      position = this.add.sprite(-100,-100,"position").setDepth(3)

      //點擊移動      
      this.input.on('pointerdown', function (pointer) {
        player.rotation = Phaser.Math.Angle.Between(player.x,player.y,pointer.x,pointer.y)-1
        if ( reverse ) {
          pointerX = 450-pointer.x
          pointerY = 800-pointer.y
        } else {
          pointerX = pointer.x, pointerY = pointer.y
        }
        position.setPosition(pointerX, pointerY)
        position.alpha = 1
        let x = pointerX - player.x
        let y = pointerY - player.y
        // let d = Math.sqrt(x * x + y * y)
        let r = Math.atan2(y, x)
        ctrlX = Math.cos(r)
        ctrlY =  Math.sin(r)
      }, this)

      particles = this.add.group()
      // 海洋生物
      enemies = this.physics.add.group({
        immovable: true
      })
      this.physics.add.collider(player, enemies)
      //獎勵道具
      awards = this.physics.add.group({
        immovable: true
      })
      this.physics.add.collider(player, awards)

      pickItem = this.sound.add('pickItem')
      superStar = this.sound.add('superStar')
      hurt = this.sound.add('hurt')
      paralyze = this.sound.add('paralyze')
      dive = this.sound.add('dive')
      eat = this.sound.add('eat')
      darkness = this.sound.add('darkness')

      //載入動畫        
      this.anims.create({
        key: 'playerSupper',
        frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
        frameRate: 4,
        repeat: -1
      })    
      this.anims.create({
        key: 'playerSlow',
        frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
        frameRate: 2,
        repeat: -1
      })      
      this.anims.create({
        key: 'playerChaos',
        frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
        frameRate: 4,
        repeat: -1
      }) 
      this.anims.create({
        key: 'playerHurt',
        frames: this.anims.generateFrameNumbers('player', { start: 16, end: 17 }),
        frameRate: 4,
        repeat: 0
      }) 
      this.anims.create({
        key: 'playerScared',
        frames: this.anims.generateFrameNumbers('player', { start: 18, end: 19 }),
        frameRate: 2,
        repeat: 0
      }) 
      this.anims.create({
        key: 'ink',
        frames: this.anims.generateFrameNumbers('ink', { end: 3 }),
        frameRate: 8,
        repeat: 0
      })      
      this.anims.create({
        key: 'inkEnd',
        frames: this.anims.generateFrameNumbers('ink', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: 0
      })
      this.anims.create({
        key: 'eel',
        frames: this.anims.generateFrameNumbers('eel', { end: 2 }),
        frameRate: 6,
        repeat: -1 
      })
      this.anims.create({
        key: 'cuttlefish',
        frames: this.anims.generateFrameNumbers('cuttlefish', { end: 4 }),
        frameRate: 8,
        repeat: -1 
      })
      this.anims.create({
        key: 'shark',
        frames: this.anims.generateFrameNumbers('shark', { end: 3 }),
        frameRate: 4,
        repeat: -1 
      })
      this.anims.create({
        key: 'eat',
        frames: this.anims.generateFrameNumbers('shark', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: 0 
      })
      shine = this.add.sprite(0, 0, 'shine').setOrigin(0, 0)
      ink = this.add.sprite(0, 0, 'ink', 7).setOrigin(0, 0).setDepth(1)
      shine.play('shine', true)
      player.play('playerNormal', true)

      //進場
      startText = this.add.text (x, y, "START", {
        fontFamily: 'Noto Sans',
        fontSize: '40px',
        color: '#FFF'
      }).setOrigin(0.5, 0.5)
      this.tweens.add({
        targets: startText,
        alpha: 0,
        delay: 1000,
        duration: 500,
        onComplete: () => {
          gameStart = true
        }
      })

      this.add.image(0, 0, 'UIbar').setOrigin(0, 0).setDepth(2)
      O2bar = this.add.sprite(16, 12, 'O2bar').setOrigin(0, 0).setDepth(2)
      //生命顯示
      lifes = this.add.group({
        key: "bubble",
        repeat: life-1,
        setXY: { x: 40, y: 35, stepX: 50 },
      }).setDepth(2)

      depthText = this.add.text (15, 70, "目前深度： " + depth + "m", {
        fontFamily: 'Noto Sans TC',
        fontSize: '16px',
        color: '#FFF'
      }).setDepth(2)

      this.physics.add.collider(player, enemies, enemyEffect)
      this.physics.add.collider(player, awards, awardEffect)
    }
    update() {
      if ( death ){        
        this.scene.pause('play')
        this.scene.launch('end')
      } else if ( gameStart ) {
        if ( Math.abs(player.x - pointerX) > Math.abs(ctrlX * playerSpeed) ) {
          player.x += ctrlX * playerSpeed 
          player.y += ctrlY * playerSpeed
        } else {
          position.alpha = 0
        }
        Object.keys(timer).forEach(time => {timer[time]++})
        O2bar.setScale( 1-timer.life/1000, 1)
        while( timer.speed > gameSpeed-degree ){
          depth++
          score++
          bg.setScale( 1, 1+depth/1000) //景深
          if( depth%250 == 0 && degree < 8 ) degree++ //每250米加速
          depthText.text = "目前深度： " + depth + "m"
          timer.speed = 0
          if( depth == 150) {
            seafood.push("cuttlefish")
            items.push("antique2")
          } else if ( depth == 400 ) {
            seafood.shift() //移除河豚
          } else if ( depth == 650 ) {
            items.push("antique3")
            seafood.push("shark")
          } else if ( depth == 1000 ) {
            seafood.splice(0, 1, "blobfish") //水滴魚替換掉鰻魚
          }
        }
        //氧氣減少
        while( timer.life > 1000 ){
          loseLife()
          timer.life = 0
        }        
        //怪物生成
        while( timer.enemy > Math.sin(1/degree)*200 ) { //根據當前難度調整怪物生成曲線
          let index = Phaser.Math.Between(0, seafood.length-1)
          let seafoodWidth,seafoodHeight
          let firstX = 20, secendX = 430, offsetX = 0, offsetY = 0
          if ( seafood[index] == "pufferfish" ){
            seafoodWidth = 50, seafoodHeight = 40
          } else if ( seafood[index] == "eel" ){
            seafoodWidth = 90,seafoodHeight = 40
            firstX = -60, secendX = 20, offsetX = 60, offsetY = 6
          } else if ( seafood[index] == "cuttlefish" ){
            seafoodWidth = 80, seafoodHeight = 80
            offsetX = 20, offsetY = 10
          } else if ( seafood[index] == "shark" ){
            seafoodWidth = 90, seafoodHeight = 60
            offsetY = 15
            firstX = 430, secendX = 500
          } else if ( seafood[index] == "blobfish" ){
            seafoodWidth = 61, seafoodHeight = 45      
          }

          enemy = this.physics.add.sprite(Phaser.Math.Between(firstX, secendX),Phaser.Math.Between(800, 850),seafood[index])
          enemy.body.setSize(seafoodWidth, seafoodHeight, 0, 0).setOffset(offsetX, offsetY)
          enemies.add(enemy)
          enemy.body.setVelocityY( -50*(degree+1) )
          if( seafood[index] != "pufferfish" && seafood[index] != "blobfish" ) {
            enemy.play(seafood[index])
          }
          if( seafood[index] == "eel" ) {
            enemy.body.setVelocityX(Phaser.Math.Between(50, 300))
          } else if( seafood[index] == "shark") {
            enemy.body.setVelocityX(Phaser.Math.Between(-50, -300))
          }
          timer.enemy = 0
        }
        //回收怪物
        enemies.getChildren().forEach((el) => {
          if (el.y < 0) {
            el.destroy()
          }
        })
        //道具生成
        while( timer.award > 250 ){
          award = this.physics.add.sprite(Phaser.Math.Between(50, 400),Phaser.Math.Between(800, 850),items[Phaser.Math.Between(0, items.length-1)])
          awards.add(award)
          award.body.setVelocityY( -75*degree )
          timer.award = 0
        }
        //回收道具
        awards.getChildren().forEach((el) => {
          if (el.y < 0) {
            el.destroy()
          }
        })
        //氣泡粒子
        particleTimer++
        while( particleTimer > 50 ){
          particle = this.physics.add.sprite(Phaser.Math.Between(0, 450),Phaser.Math.Between(800, 850), "particle", Phaser.Math.Between(0, 2))
          particles.add(particle)
          particle.body.setVelocityY( Phaser.Math.Between(-200, -450) )
          particleTimer = 0
        }
        //回收氣泡粒子
        particles.getChildren().forEach((el) => {
          if (el.y < 0) {
            el.destroy()
          }
        })
      }
    }
  }
  
  //結算畫面
class end extends Phaser.Scene {
  constructor() {
    super('end')
  }
  create() {
      const x = this.scale.width * 0.5
      const y = this.scale.height * 0.5
      this.add.image(x, y, 'scorePad')
      let collection_count = collection.reduce((obj,item)=>{
        if (item in obj) {
          obj[item]++
        } else {
          obj[item] = 1
        }
        return obj
      },{})
      Object.keys(collection_count).forEach((el,index) => {
        this.add.image(x-40, y+20-(index*40), el).setScale(0.5)
        this.add.text (x+80, y+20-(index*40), "x " + collection_count[el] + "  x " + antiqueScore[el], {
          fontFamily: 'Noto Sans',
          fontSize: '16px',
          color: '#FFF'
        }).setOrigin(1, 0.5)
      })
      this.add.text (x-40, y+60, "下潛深度：" + depth, {
        fontFamily: 'Noto Sans TC',
        fontSize: '16px',
        color: '#FFF'
      }).setOrigin(0, 0.5)
      this.add.text (x+100, y+120, "totle: "+score, {
        fontFamily: 'Noto Sans',
        fontSize: '32px',
        color: '#FFF'
      }).setOrigin(1, 0.5)

      this.add.image(x-75, y+200, 'exitBtn').setInteractive().on('pointerup', function () {
        pushBtn.play()
        history.back()
      })
      this.add.image(x+75, y+200, 'againBtn').setInteractive().on('pointerup', function () {
        pushBtn.play()
        init()
        this.scene.scene.start('menu')
      })
    }
  }

  function awardEffect (player, award) {
    if ( gameStart ) {
      pickItem.play()
      if (award.texture.key == "bubble") {
        if( life < 8 ) {
          addLife()
        } else {
          timer.life = 0
        }
      } else if (award.texture.key == "star") {
        invincible++
        degree += 2
        playerSpeed = 6
        player.play('playerSupper', true)
        superStar.play()
        enemies.clear(true, true)
        window.setTimeout( function() {
          invincible--
          degree -= 2
          if( invincible == 0 ) {
            playerSpeed = 4
            player.play('playerNormal')            
          }
        }, 5000)
      } else {
        score += antiqueScore[award.texture.key]
        collection.push(award.texture.key)
      }
      award.destroy()
    }
  }

  function enemyEffect (player, enemy) {
    if ( invincible == 0 ){
      // enemy.alpha = 0.5
      enemy.body.checkCollision.none = true
      if (enemy.texture.key == "pufferfish") {
        hurt.play()
        player.play('playerHurt')
        enemy.setFrame(1)
        player.alpha = 0.5
        window.setTimeout( function() {
          player.alpha = 1     
          player.play('playerNormal')
          }, 500)
        loseLife()
      } else if (enemy.texture.key == "eel") {
        paralyze.play()
        playerSpeed /= 2
        player.play('playerSlow')
        window.setTimeout( function() {
          if ( playerSpeed == 2 ) {
            playerSpeed *= 2
            player.play('playerNormal')
          } else if ( playerSpeed < 2 ) {
            playerSpeed *= 2
          }
        }, 3000)
      } else if ( enemy.texture.key == "cuttlefish" && !isInk) {
        dive.play()
        isInk = true
        ink.play('ink', true)
        window.setTimeout( function() {
          ink.play('inkEnd', true)
          isInk = false
          }, 2000)
      } else if (enemy.texture.key == "shark") {
        eat.play()
        ink.destroy()
        enemy.setVelocityY(0)
        playerSpeed = 0
        player.setPosition(enemy.x-150, enemy.y)
        player.play('playerScared')
        player.body.checkCollision.none = true
        enemy.play('eat', true)
        window.setTimeout( function() {
          player.destroy()
          death = true
          }, 500)
      } else if (enemy.texture.key == "blobfish") {
        darkness.play()
        reverse = !reverse
        if( reverse ) {
          player.play('playerChaos')
        } else {          
          player.play('playerNormal')
        }
      }
    }
  }

  function loseLife() {
    lifes.getChildren()[lifes.getChildren().length - 1].destroy()
    if( life > 1 ) {
      life-=1
    } else {
      death = true
    }
  }

  function addLife() {
    life+=1
    lifes.create( 40+50*(life-1), 35, "bubble").setDepth(2)
  }

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 450,
        height: 800
    },
    physics: {
        default: 'arcade',
        arcade: {
        gravity: { y: 0 },
        debug: false
        }
    },
    scene: [boot, load, play, menu, story, end]
}
const game = new Phaser.Game(config)