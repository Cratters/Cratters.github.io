/*可調整參數*/
let life = 3 //生命數
let blockDownTime = 8 //磚塊下降時間越大越慢 預設8偵下降1px
let ballSpeed = 12 //數字越大球越快

//關卡陣列，level1 ~ level5，可視需求新增、替換
const blockMap = [
  "level1",
  "level2",
  "level3"
]
/****************** 遊 戲 說 明 【breakout】 ******************/

// 按住跳床來移動，放開手指發球
// 控制球的反彈來擊破雲層
// 球用完或雲層下降至底皆算失敗

/*************************************************************/

//遊戲參數
let level = 0
let score = 0
let timer = 0
let gameOver = false
let gameStart = false

//音效
let shotball
let breakout
let lostlife
let win
let lost

//文字物件
let levelText
let scoreText

//遊戲物件
let lifes
let board
let ball
let blocks
let nana
let san
let shine
//按鈕
let story1
let story2
let tutorial

class boot extends Phaser.Scene {
  constructor() {
      super('boot')
  }
  preload() {
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
          var w = Math.floor(this.preloadSprite.width * value)
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
    this.load.image('shine', './assets/shine.png')
    this.load.image('ball', './assets/ball.png')
    this.load.spritesheet('board', './assets/board.png', {frameWidth: 112, frameHeight: 37})
    this.load.spritesheet('nana', './assets/nana.png', {frameWidth: 48, frameHeight: 75})
    this.load.spritesheet('san', './assets/san.png', {frameWidth: 48, frameHeight: 75})
    this.load.image('blocks', './assets/blocks.png')
    this.load.tilemapTiledJSON('level', './assets/level.json')
    this.load.audio('shotball', './assets/audio/shotball.wav')
    this.load.audio('breakout', './assets/audio/breakout.wav')
    this.load.audio('lostlife', './assets/audio/lostlife.wav')
    this.load.audio('win', './assets/audio/round_end.wav')
    this.load.audio('lost', './assets/audio/death.wav')
    this.load.audio('bgm', './assets/audio/happy_adveture.mp3')
    
    this.load.image('startBtn', './assets/startBtn.png')
    this.load.image('skipBtn', './assets/skipBtn.png')
    this.load.image('againBtn', './assets/againBtn.png')
    this.load.image('exitBtn', './assets/exitBtn.png')
    this.load.image('lostImg', './assets/lostImg.png')
    this.load.image('winImg', './assets/winImg.png')
    this.load.image('story1', './assets/story1.png')
    this.load.image('story2', './assets/story2.png')
    this.load.image('tutorial', './assets/tutorial.png')
    
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
    this.add.image(0, 0, 'menu').setOrigin(0, 0)
    this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'startBtn').setOrigin(0.5, 0.5)
      .setInteractive().on('pointerup', function (pointer, localX, localY, event) {
        this.scene.scene.start('story')
      })
  }
}

class story extends Phaser.Scene {
  constructor() {
    super('story')
  }
  create() {
    tutorial = this.add.image(0, 0, 'tutorial').setOrigin(0).setInteractive()
    story2 = this.add.image(0, 0, 'story2').setOrigin(0).setInteractive()
    story1 =this.add.image(0, 0, 'story1').setOrigin(0).setInteractive()

    story1.on('pointerdown', function() {
        story1.destroy(true)
    })
    story2.on('pointerdown', function() {
        story2.destroy(true)
    })
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
      //背景元素
      this.add.image(0, 0, 'bg').setOrigin(0, 0)
      shine = this.add.sprite(-100, 720, 'shine')
      this.tweens.add({
          targets: shine,
          x: 550,
          duration: 2000,
          repeatDelay: 2000,
          repeat: -1
      })

      //音效
      shotball = this.sound.add('shotball')
      breakout = this.sound.add('breakout')
      lostlife = this.sound.add('lostlife')
      lost = this.sound.add('lost')
      win = this.sound.add('win')

      //關卡提示
      gameStart = false 
      const x = this.scale.width * 0.5
      const y = this.scale.height * 0.5
      levelText = this.add.text (x, y-100, "第"+(level+1)+"關", {
        fontFamily: 'Noto Sans TC',
        fontSize: '32px',
        color: '#999'
      }).setOrigin(0.5, 0.5)
      levelText.alphaTween = this.tweens.add({
        targets: levelText,
        x: x,
        y: y,
        duration: 1000
      })
      levelText.alphaTween = this.tweens.add({
        targets: levelText,
        alpha: 0,
        delay: 1000,
        duration: 500,
        onComplete: () => {
          gameStart = true
        }
      })

      //生命顯示
      lifes = this.add.group({
        key: "ball",
        repeat: life-1,
        setXY: { x: 15, y: 23, stepX: 30 },
      })

      //計分顯示
      scoreText = this.add.text(x, 15, "Score: "+score).setOrigin(0.5, 0)
      
      board = this.physics.add.sprite(x, 696, 'board').setInteractive()
      board.body.immovable = true
      board.body.moves = false
      this.anims.create({
          key: 'spring',
          frames: this.anims.generateFrameNumbers('board', { start: 0, end: 3 }),
          frameRate: 16,
          repeat: 0
      })
      nana = this.physics.add.sprite(x-67, 672, 'nana')
      this.anims.create({
          key: 'nanaRun',
          frames: this.anims.generateFrameNumbers('nana', { start: 0, end: 3 }),
          frameRate: 8,
          repeat: -1
      })
      san = this.physics.add.sprite(x+67, 672, 'san')
      this.anims.create({
          key: 'sanRun',
          frames: this.anims.generateFrameNumbers('san', { start: 0, end: 3 }),
          frameRate: 8,
          repeat: -1
      })
      
	    const map = this.make.tilemap({ key: 'level' })
      const tileset = map.addTilesetImage('blocks', 'blocks')
      blocks = map.createDynamicLayer(blockMap[level], tileset, 0, 75).setCollisionByExclusion([-1])

      ball = this.physics.add.sprite(300, 850-board.height/2, "ball")
      ball.setBounce(1)
      ball.setCollideWorldBounds(true)
      this.physics.world.checkCollision.down = false
      this.physics.add.collider(ball, blocks, blockBounce, null, this)
      this.physics.add.collider(ball, board, boardBounce, null, this)
      resetBall()
    }

    update() {
      if ( gameStart ) {
        if ( this.input.x && board.x != this.input.x) {
          board.x = this.input.x
          nana.x = this.input.x - 67
          san.x = this.input.x + 67
          nana.play('nanaRun', true)
          san.play('sanRun', true)
        }
        this.input.on('pointerup', () => {
          shootBall()
        })
      }
      if ( !ball.isShot ) {
        ball.x = board.x
      } else {
        timer++
        while (timer > blockDownTime) {
          blocks.y += 1
          timer = 0
        }
      }
      if ( blocks.y > 565 ) {          
        gameOver = true
        this.scene.pause('play')
        this.scene.launch('end')
      }
      if ( ball.body.y > 1066 ) {
        if ( life > 1 ) {
          loseLife()
        } else {
          lost.play()
          lifes.getChildren()[lifes.getChildren().length - 1].destroy()
          gameOver = true
          this.scene.pause('play')
          this.scene.launch('end')
        }
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
      let endContent
      if ( gameOver ) {
        this.add.image(x, y, 'lostImg')
      } else {
        this.add.image(x, y, 'winImg')
      }
      this.add.text (x, y-80, "Score： " + score, {
        fontFamily: 'Noto Sans TC',
        fontSize: '32px',
        color: '#FFF'
      }).setOrigin(0.5, 0.5)
      this.add.image(x-75, y+125, 'exitBtn').setInteractive().on('pointerup', function () {
        history.back()
      })
      this.add.image(x+75, y+125, 'againBtn').setInteractive().on('pointerup', function () {
        life = 3
        level = 0
        score = 0
        gameOver = false
        this.scene.scene.start('menu')
      })
    }
  }

  function resetBall() {
    ball.enableBody(true, board.x, board.y - board.height/2, true, true)
    ball.body.velocity.set(0)
    ball.isShot = false
  }

  function shootBall() {
    if (ball.isShot) return
    let velY = ballSpeed * -50
    ball.isShot = true
    ball.body.velocity.set(0, velY)
    shotball.play()
  }

  function blockBounce(ball, block) {
    breakout.play()
    score++
    scoreText.text = "Score: "+score
    if( blocks.getTileAt(block.x, block.y).index > 1 ) {
      blocks.getTileAt(block.x, block.y).index -= 1
    } else {
      blocks.removeTileAt(block.x, block.y)
      if( blocks.culledTiles.length <= 1 ){
        level++ //進入下一關
        if( level >= blockMap.length ){
          win.play() 
          this.scene.pause('play')   
          this.scene.launch('end')
        } else {
          this.scene.start('play')
        }
      }
    }
    return false
  }
  
  function boardBounce(ball, board) {
    if (ball.isShot) {
      board.play('spring', true)
      shotball.play()
    }
    ball.body.setVelocityX((100 * ballSpeed * (ball.x - board.x)) / board.width)
  }

  function loseLife() {
    lostlife.play()
    life-=1
    lifes.getChildren()[lifes.getChildren().length - 1].destroy()
    resetBall()
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