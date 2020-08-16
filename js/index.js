const switchPlayButtonIcon = (isPlaying) => {
    let playButton = e(".class-span-play")
    let classList = playButton.classList
    if (isPlaying) {

        classList.add("icon-zanting")
        classList.remove("icon-bofang")
        return
    }
    classList.add("icon-bofang")
    classList.remove("icon-zanting")
};

const musicPlayEvent = (audioPlayer) => {
    audioPlayer.play()
    switchPlayButtonIcon(true)
};

const musicPauseEvent = (audioPlayer) => {
    audioPlayer.pause()
    switchPlayButtonIcon(false)
};

const bindPlayButtonEvent = () => {
    let playButton = e(".class-span-play")
    bindEvent(playButton, "click", function (event) {
        let audioPlayer = e("audio")
        let isPausing = audioPlayer.paused
        if (isPausing) {
            musicPlayEvent(audioPlayer)
            return
        }
        musicPauseEvent(audioPlayer)
    })
};

//返回随机歌曲ID
const getRandomChannel = (response) => {
    let songArr = []
    for (let i = 0; i < response.length; i++) {
        let songID = response[i].id
        //log('getRandomChannel', response[i].id)
        songArr.push(songID)
        // log('songArr', songArr)
    }
    let randomChannel = Math.floor(Math.random() * songArr.length)
    log('randomChannel', randomChannel)
    let item = songArr[randomChannel]
    log('item', item)
    log('response.length', response.length)

    return item
};

const failToGetLyric = () => {
    let lyricUl = e(".class-ul-lyric")
    lyricUl.innerHTML = "<li>本歌曲展示没有歌词</li>"
};

//获取歌词
const getLyric = (sid) => {
    let newRequest = {
        method: "GET",
        url: `https://autumnfish.cn/lyric?id=${sid}`,
        callback: (response) => {
            if (response !== "error") {
                // log('getLyric', response.lrc.lyric)
                setLyric(response)
                return
            }
            failToGetLyric()
        }
    }
    ajax(newRequest)
};
const setMusicPlayer = (song) => {
    // log('setMusicPlayer', song.name, song.id)
    let url = `//music.163.com/song/media/outer/url?id=${song.id}.mp3`
    let audioPlayer = e("audio")
    let musicName = e(".class-p-musicName")
    let musicAuthor = e(".class-p-author")
    let musicDiv = e(".class-div-picture")
    audioPlayer.src = url
    musicName.innerHTML = song.name
    musicAuthor.innerHTML = song.ar[0].name
    musicDiv.style.backgroundImage = `url(${song.al.picUrl})`
    musicPlayEvent(audioPlayer)
    getLyric(song.id)
};

const setLyric = (response) => {
    removeAllChild(".class-ul-lyric")
    let line = response.lrc.lyric.split("\n")
    // log('line', line)
    let result = handleLyric(line)
    renderLyric(result)

};

//把歌词插入到页面中
const renderLyric = (result) => {
    let lyrLi = ""
    for (let i = 1; i < result.length; i++) {
        let item = result[i]
        lyrLi += `<li data-time=${item[0]}>${item[1]}</li>`
    }
    let lyrUl = e(".class-ul-lyric")
    lyrUl.innerHTML = lyrLi
    autoChangeLyr()
};
const handleLyric = (line) => {
    let result = []
    let timeReg = /\[\d{2}:\d{2}.\d{2}\]/g
    for (let i = 0; i < line.length; i++) {
        let item = line[i]
        let time = item.match(timeReg)
        if (!time) {
            continue
        }
        let value = item.replace(timeReg, "")
        for (let j = 0; j < time.length; j++) {
            let t = time[j].slice(1, -1).split(":")
            let timeNum = parseInt(t[0], 10) * 60 + parseFloat(t[1])
            result.push([timeNum, value])
        }
    }
    result.sort((a, b) => {
        return a[0] - b[0]
    })
    return result
};


const autoChangeLyr = () => {
    let player = e("audio")
    setInterval(() => {
        let lyrUl = e(".class-ul-lyric")
        let liHeight = getIndexChild(lyrUl, 5).clientHeight - 3
        let liArray = lyrUl.children
        for (let i = 0; i < liArray.length - 1; i++) {
            let item = liArray[i]
            let currentTime = item.dataset.time
            let nextTime = liArray[i + 1].dataset.time
            let playerTime = player.currentTime
            if ((playerTime > currentTime) && (currentTime < nextTime)) {
                removeAllClass("active")
                item.classList.add("active")
                lyrUl.style.top = `${-(liHeight * (i - 2))}px`
            }
        }
    }, 100)
};


const getChannelIdFromDataSet = () => {
    let musicInfoDiv = e(".class-div-musicInfo")
    let id = musicInfoDiv.dataset.channelId
    log('getChannelIdFromDataSet', id)
    return id
};

const requestMusic = (channelId) => {
    let musicRequest = {
        url: `https://autumnfish.cn/song/detail?ids=${channelId}`,
        method: "GET",
        callback: (response) => {
            log('requestMusic', response.songs)
            let song = response.songs[0]
            setMusicPlayer(song)
        }
    }
    ajax(musicRequest)
};

const getMusicSource = () => {
    let channelRequest = {
        url: "https://autumnfish.cn/playlist/detail?id=5184728560",
        method: "GET",
        callback: (response) => {
            let a = response.playlist.trackIds
            let singleChannel = getRandomChannel(a)
            log('getMusicSource', singleChannel)
            let musicInfoDiv = e(".class-div-musicInfo")
            musicInfoDiv.dataset.channelId = singleChannel
            requestMusic(singleChannel)
            log('getMusicSource', response)
        }
    }
    ajax(channelRequest)
};

const autoEvent = (musicPlayer, inProgressBar) => {
    setInterval(() => {
        let length = musicPlayer.currentTime / musicPlayer.duration * 100
        inProgressBar.style.width = `${length}%`
    }, 500)
};

const barMouseDownEvent = (musicPlayer, outProgressBar, inProgressBar) => {
    bindEvent(outProgressBar, "mousedown", function (event) {
        let offset = event.offsetX
        let rangeX = offset / 400
        musicPlayer.currentTime = musicPlayer.duration * rangeX
    })
};

const bindProgressBarEvent = () => {
    let musicPlayer = e("audio")
    let inProgressBar = e(".class-span-inProgressbar")
    let outProgressBar = e(".class-span-outProgressbar")
    autoEvent(musicPlayer, inProgressBar)
    barMouseDownEvent(musicPlayer, outProgressBar, inProgressBar)
};

const bindPlayerEndEvent = () => {
    let audioPlayer = e("audio")
    bindEvent(audioPlayer, "ended", function (event) {
        let state = e(".class-span-loop").dataset.state
        if (state === "open") {
            audioPlayer.currentTime = 0
            musicPlayEvent(audioPlayer)
            return
        }
        let id = getChannelIdFromDataSet()
        requestMusic(id)
        switchPlayButtonIcon(false)
        clearInterval(audioPlayer.dataset.currentTimeId)
    })
};

const bindNextSongEvent = () => {
    let nextSongButton = e(".class-span-next")
    bindEvent(nextSongButton, "click", function (event) {
        getMusicSource()
        let id = getChannelIdFromDataSet()
        setMusicPlayer()
        requestMusic(id)
    })
};

const changePlayerSound = (isSound) => {
    let musicPlayer = e("audio")
    if (isSound) {
        let barSelector = e(".class-span-inSoundbar")
        let volumeNum = Number(barSelector.dataset.volume)
        musicPlayer.volume = volumeNum
        return
    }
    musicPlayer.volume = 0
};

const switchSoundIcon = (element) => {
    let state = element.dataset.state
    if (state === "open") {
        element.classList.remove("icon-yinliang")
        element.classList.add("icon-jinying")
        element.dataset.state = "close"
        changePlayerSound(false)
        return
    }
    element.classList.remove("icon-jinying")
    element.classList.add("icon-yinliang")
    changePlayerSound(true)
    element.dataset.state = "open"
};

//音量控制
const bindSoundButtonEvent = () => {
    let soundButton = e(".class-span-sound")
    bindEvent(soundButton, "click", function (event) {
        let self = event.target
        switchSoundIcon(self)
    })
};

const bindSoundBarEvent = () => {
    let inSoundBar = e(".class-span-inSoundbar")
    let outSoundBar = e(".class-span-outSoundbar")
    bindEvent(outSoundBar, "mousedown", function (event) {
        let offset = event.offsetX
        inSoundBar.style.width = `${offset}.px`
        let soundButton = e(".class-span-sound")
        let soundState = soundButton.dataset.state
        if (soundState === "open") {
            let musicPlayer = e("audio")
            let num = offset / 80
            musicPlayer.volume = num
            inSoundBar.dataset.volume = num
        }
    })
};

//歌曲循环
const changeLoopButtonState = (loopButton) => {
    let state = loopButton.dataset.state
    if (state === "close") {
        loopButton.classList.add("class-span-loop-start")
        loopButton.dataset.state = "open"
        return
    }
    loopButton.classList.remove("class-span-loop-start")
    loopButton.dataset.state = "close"
};

const bindLoopButtonEvent = () => {
    let loopButton = e(".class-span-loop")
    bindEvent(loopButton, "click", function (event) {
        let self = event.target
        changeLoopButtonState(self)
    })
};

const bindPlayEvents = () => {
    bindPlayButtonEvent()
    bindPlayerEndEvent()
    bindNextSongEvent()
};

const bindSoundEvents = () => {
    bindSoundButtonEvent()
    bindSoundBarEvent()
};

//时间进度
const autoChangeCurrentTime = (self, currentSelector, durationSelector) => {
    let durationTime = self.duration
    durationSelector.innerHTML = transFloatToTime(durationTime)
    let currentTimeId = setInterval(function () {
        let currentTime = transFloatToTime(self.currentTime)
        currentSelector.innerHTML = currentTime
    }, 1000)
    self.dataset.currentTimeId = currentTimeId
};
const bindMusicCanPlayEvent = () => {
    let musicPlayer = e("audio")
    let currentSelector = e("#id-span-currentTime")
    let durationSelector = e("#id-span-duration")
    bindEvent(musicPlayer, "canplay", function (event) {
        let self = event.target
        autoChangeCurrentTime(self, currentSelector, durationSelector)
    })
};

const bindLyrcButtonEvent = () => {
    let lyrcButton = e(".class-span-lyrics")
    let lyrcDiv = e(".class-div-lyricView")
    bindEvent(lyrcButton, "click", function (event) {
        let self = event.target
        if (self.style.color === "grey") {
            self.style.color = "black"
            lyrcDiv.style.display = "block"
        } else {
            self.style.color = "grey"
            lyrcDiv.style.display = "none"
        }
    })
};

const bindEvents = () => {
    bindMusicCanPlayEvent()
    bindPlayEvents()
    bindSoundEvents()
    bindProgressBarEvent()
    bindLoopButtonEvent()
    bindLyrcButtonEvent()
};


const __main = () => {
    getMusicSource()
    bindEvents()
};

__main()
