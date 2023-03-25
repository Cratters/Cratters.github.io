

/*可調整參數*/
let degree = 2 // 1簡單 2普通 3困難

/****************** 遊 戲 說 明 【糖果夢魘】 ******************/

//避開比自己體型大的糖果
//吃掉比自己體型小的糖果來變大

/*************************************************************/

//直屏偵測
let defaultWidth,defaultHeight,ctrlX,ctrlY,diff=0,angleDiff=0
if( window.innerWidth > window.innerHeight ){
  // landscape
  defaultWidth = 800, defaultHeight = 450
  ctrlX = 720
  ctrlY = 380
}
else{
  // portrait
  defaultWidth = 450, defaultHeight = 800
  diff = 350
  angleDiff = 90
  ctrlX = 70
  ctrlY = 720
}

//遊戲參數宣告
let timer, score, playerSpeed, playerScale, death, gameStart, gameOver, pointerX, pointerY
function init() {
  timer = {
    death : 0,
    candy : 0
  }
  score = 0
  playerSpeed = 2
  playerScale = 10
  death = false 
  gameOver = false
  gameStart = false
  pointerX = 225
  pointerY = 200
} 

//文字物件
let startText
let scoreText

//遊戲物件
let player
let controller
let gamePad
let candy
let candies = []

//前導故事&教學
let tutorial

//音效
let eat

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
    this.load.image('menu', './assets/menu.png')
    this.load.image('bg', './assets/bg.png')
    this.load.spritesheet('touch', './assets/touch.png', {frameWidth: 64, frameHeight: 64})
    this.load.image('player', './assets/player.png')
    this.load.spritesheet('candy', './assets/candy.png', {frameWidth: 180, frameHeight: 250})

    //音樂音效
    this.load.audio('bgm', './assets/audio/SkeletonDance-Myuu.mp3')
    this.load.audio('eat', './assets/audio/Heal.m4a')
    
    //畫面UI
    this.load.spritesheet("touch", "touch.png",64,64)
    this.load.image('tutorial', './assets/tutorial.png')
    this.load.image('startBtn', './assets/startBtn.png')
    this.load.image('skipBtn', './assets/skipBtn.png')
    this.load.image('againBtn', './assets/againBtn.png')
    this.load.image('exitBtn', './assets/exitBtn.png')
    this.load.image('scorePad', './assets/scorePad.png')
    
  }
  create() {
    //背景音樂
    const bgm = this.sound.add('bgm', {
      volume: 0.5,
      loop: true
    })
    bgm.play()
    this.scene.start('menu')
  }
}

class menu extends Phaser.Scene {
  constructor() {
    super('menu')
  }
  create() {
    this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'menu').setAngle(angleDiff)
    this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'startBtn', 1).setAngle(angleDiff)
      .setInteractive().on('pointerup', function () {
        this.scene.scene.start('story')
      })
  }
}

class story extends Phaser.Scene {
  constructor() {
    super('story')
  }
  create() {
    tutorial = this.add.image(defaultWidth/2, defaultHeight/2, 'tutorial').setAngle(angleDiff).setInteractive()
    tutorial.on('pointerdown', function() {
      this.scene.scene.start('play')
    })
    if ( diff != 0 ) {
      this.add.image(0 , 400, 'skipBtn').setOrigin(0.5, 1).setAngle(angleDiff)
        .setInteractive().on('pointerup', function () {
          this.scene.scene.start('play')
        })
    } else {
      this.add.image(400 , 450, 'skipBtn').setOrigin(0.5, 1)
        .setInteractive().on('pointerup', function () {
          this.scene.scene.start('play')
        })
    }
  }
}

class play extends Phaser.Scene {
    constructor() {
      super('play')
    }
    create() {
      const x = this.scale.width * 0.5
      const y = this.scale.height * 0.5
      this.add.image(x, y, 'bg').setAngle(angleDiff)
      //玩家
      player = this.physics.add.sprite(x, y, 'player')
      player.body.immovable = true
      player.setImmovable(true)
      player.setScale(0.1).setAngle(angleDiff)
      //搖桿
      gamePad = this.add.sprite(ctrlX, ctrlY, "touch",0).setOrigin(0.5)
      controller = this.add.sprite(ctrlX, ctrlY, "touch",1).setOrigin(0.5).setInteractive()
      this.input.setDraggable (controller)
      this.input.on('drag', function(pointer, controller, xx, yy) {
        let x = xx-ctrlX
        let y = yy-ctrlY
        let d = Math.sqrt(x * x + y * y)
        if( d>50 ) d=50  
        let r = Math.atan2(y, x)
        controller.x = Math.cos(r)*d+ctrlX
        controller.y = Math.sin(r)*d+ctrlY
        if( diff!=0 ){
          if(controller.y > ctrlY) {
            player.flipX = true
          } else {          
            player.flipX = false
          }
        } else {
          if(controller.x > ctrlX) {
            player.flipX = true
          } else {          
            player.flipX = false
          }
        }
        if(!death){
          if( player.x > 795-diff) {
            player.x = 5
          } else if( player.x < 5) {
            player.x = 795-diff
          }
          if( player.y > 445+diff) {
            player.y = 5
          } else if( player.y < 5) {
            player.y = 445+diff
          }
        }
        })
      this.input.on('dragend', function() {
        controller.x = ctrlX
        controller.y = ctrlY
        })

      candies = this.physics.add.group({
        immovable: true
      })

      this.physics.add.collider(player, candies)

      //載入音效
      eat = this.sound.add('eat')

      //進場倒數
      startText = this.add.text (x, y, "START！", {
        fontFamily: 'Noto Sans TC',
        fontSize: '40px',
        color: '#FFF'
      }).setOrigin(0.5, 0.5).setAngle(angleDiff)
      this.tweens.add({
        targets: startText,
        alpha: 0,
        delay: 1000,
        duration: 500,
        onComplete: () => {
          gameStart = true
        }
      })
      //計分顯示
      scoreText = this.add.text (780-diff, 10+diff*2.2, "SCORE："+score, {
        fontFamily: 'Noto Sans TC',
        fontSize: '16px',
        color: '#FFF'
      }).setOrigin(1, 0).setAngle(angleDiff)

      this.physics.add.collider(player, candies, candyEffect)
    }
    update() {
      if ( gameOver ){        
        this.scene.pause('play')
        this.scene.launch('end')
      }
      if ( gameStart ) {
        if ( !death ) {
          player.x += (controller.x-ctrlX) / 30 * playerSpeed 
          player.y += (controller.y-ctrlY) / 30 * playerSpeed
          Object.keys(timer).forEach(time => {timer[time]++})
        } else {
          timer.death--
          if( timer.death == -180 ){
            gameOver = true
          }
        }
        //糖果生成
        while( timer.candy > Math.sin(1/degree)*50 ){
          let x, xx, y, yy, f=1, arrow = Phaser.Math.Between(0, 3)
          if (arrow == 0) { //上
            x = 10, xx = 790, y = -125, yy = -125
            xx-=diff
          } else if (arrow == 1) { //下
            x = 10, xx = 790, y = 575, yy = 575
            f = -1
            xx-=diff, y+=diff, yy+=diff
          } else if (arrow == 2) { //左
            x = -90, xx = -90, y = 10, yy = 440
            yy+=diff
          } else if (arrow == 3) { //右
            x = 890, xx = 890, y = 10, yy = 440
            f = -1
            x-=diff, xx-=diff, yy+=diff
          }

          candy = this.physics.add.sprite(Phaser.Math.Between(x, xx),Phaser.Math.Between(y, yy),'candy',Phaser.Math.Between(0, 3))
          candies.add(candy)
          if( arrow < 2){
            candy.body.setVelocityY( Phaser.Math.Between(20, 50)*f )
          } else {
            candy.body.setVelocityX( Phaser.Math.Between(20, 50)*f )
          }
          candy.setScale(Phaser.Math.Between(5,playerScale+5*degree)*0.01)
          let color = getRandomColor()
          candy.setTint(0xFFFFFF, 0x00FFFF, color, color)
          candy.setAngle(Phaser.Math.Between(0,360))

          timer.candy = 0
        }
        //回收糖果
        candies.getChildren().forEach((el) => {
          if (el.y < -125 || el.y > 575+diff || el.x < -90 || el.x > 890-diff) {
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
    
    this.add.image(x, y, 'scorePad').setAngle(angleDiff)
    this.add.text (x, y, score, {
      fontFamily: 'Noto Sans TC',
      fontSize: '32px',
      color: '#FFF'
    }).setOrigin(0.5, 0.5).setAngle(angleDiff)

    let dash = ( diff != 0 ) ? 1 :-1
    this.add.image(x-75, y-75*dash, 'exitBtn').setInteractive().on('pointerup', function () {
      history.back()
    }).setAngle(angleDiff)
    this.add.image(x-75*dash, y+75, 'againBtn').setInteractive().on('pointerup', function () {
      // 重置遊戲參數
      init()
      this.scene.scene.start('menu')
    }).setAngle(angleDiff)
  }
}

function candyEffect (player, candy) {
  eat.play()
  if ( playerScale > candy.scale*100 && !death ){
    score += parseInt(candy.scale*100)
    scoreText.text = "SCORE: "+score
    candy.destroy()
    playerScale = parseInt(10+score/50)
    player.setScale(playerScale*0.01)
  } else {
    timer.death = 0
    player.x = candy.x
    player.y = candy.y
    player.setVelocityX(candy.body.velocity.x)
    player.setVelocityY(candy.body.velocity.y)
    player.body.checkCollision.none = true
    death = true
  }
}

function getRandomColor() {
  let letters = '0123456789ABCDEF'.split('')
  let color = '0x'
  for (let i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const config = {
  type: Phaser.AUTO,
  scale: {
      mode: Phaser.Scale.FIT,
      parent: 'game',
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: defaultWidth,
      height: defaultHeight
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
