const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')


const app = {
    currentIndex: 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    songs: [
        {
            name: 'Em',
            singer: 'Xám',
            path: './assets/img/Em.m4a',
            image: './assets/img/Xám.jpg' 
        },
        {
            name: 'Bạn không hiểu tôi',
            singer: 'Tôi',
            path: './assets/img/Bankhonghieutoi.m4a',
            image: './assets/img/Shisui.jpg' 
        },
        {
            name: 'Cho anh cho em',
            singer: 'Seachain',
            path: './assets/img/Choanhchoem.m4a',
            image: './assets/img/seachain.png' 
        },
        {
            name: 'Smile',
            singer: 'Obito',
            path: './assets/img/Smile.m4a',
            image: './assets/img/Obito.jpg' 
        },
        {
            name: 'Em',
            singer: 'Xám',
            path: './assets/img/Em.m4a',
            image: './assets/img/Xám.jpg' 
        },
        {
            name: 'Bạn không hiểu tôi',
            singer: 'Tôi',
            path: './assets/img/Bankhonghieutoi.m4a',
            image: './assets/img/Shisui.jpg' 
        },
        {
            name: 'Cho anh cho em',
            singer: 'Seachain',
            path: './assets/img/Choanhchoem.m4a',
            image: './assets/img/seachain.png' 
        },
        {
            name: 'Smile',
            singer: 'Obito',
            path: './assets/img/Smile.m4a',
            image: './assets/img/Obito.jpg' 
        }
    ],

    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'song--active' : ''}">
                    <div class="thumb">
                        <img src="${song.image}" alt="">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })

        $('.playlist').innerHTML = htmls.join('\n')
    },

    defineProperties: function(){
        Object.defineProperty(this,'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents : function(){

        const cdWidth = cd.offsetWidth;
        const cdHeight = cd.offsetHeight;
        
        //Xử lý cd quay và dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform : 'rotate(360deg)'}
        ], {
            duration: 10000, //10 giây
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        //Xử lý phóng to / thu nhở C
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop ;
            const newCdWidth = cdWidth - scrollTop;
            const newCdHeight = cdHeight - scrollTop;
            
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.height = newCdHeight > 0 ? newCdHeight + 'px' : 0;

            cd.style.opacity = newCdHeight/cdHeight;
        }

        //Xủ lý khi click play
        playBtn.onclick =  function (){
            if(app.isPlaying){
                audio.pause();
            }
            else{
                audio.play();
            }
        }

        //khi bài hát (song) được play 
        audio.onplay = function(){
            app.isPlaying = true;
            player.classList.add("play");
            cdThumbAnimate.play();
        }

        //khi bài hát (song) bị pause 
        audio.onpause = function(){
            app.isPlaying = false;
            player.classList.remove("play");
            cdThumbAnimate.pause();
        }

        //Khi tiến độ bài hát thay đổi 
        audio.ontimeupdate = function(){
            if (audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration *100);
                progress.value = progressPercent
            }
        }

        //Xử lý khi tua xong
        progress.onchange = function(e){
            const seeTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seeTime;
        }

        //Khi next bài hát 
        nextBtn.onclick = function(){
            if(app.isRandom){
                app.playRandomSong();
            }else{
                app.nextSong();
            }
            audio.play();
            app.render();
        }

        //Khi prev bài hát 
        prevBtn.onclick = function(){
            if(app.isRandom){
                app.playRandomSong();
            }else{
                app.prevSong();
            }
            audio.play();
            app.render();
        }

        //khi random bài hát (bật tắt random song)
        randomBtn.onclick = function(e){
            app.isRandom = !app.isRandom
            randomBtn.classList.toggle('btn-random--active', app.isRandom);
        }

        //Xử lý lặp lại một bài hát
        repeatBtn.onclick = function(e){
            app.isRepeat = !app.isRepeat;
            repeatBtn.classList.toggle('btn-repeat--active', app.isRepeat);

        }

        //Xử lý next song khi audio ended
        audio.onended = function(){
            if(app.isRepeat){
                audio.play();
            }else{
                nextBtn.click();
            }
        }
    },

    loadCurrentSong: function(){

        heading.textContent = this.currentSong.name;
        cdThumb.src = this.currentSong.image;
        audio.src = this.currentSong.path;

        console.log(heading,cdThumb,audio);
    },

    nextSong: function(){
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function(){
        this.currentIndex--;
        if (this.currentIndex <= 0){
            this.currentIndex = this.songs.length-1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function(){
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong()
    },

    start: function(){
        //Định nghĩa thuộc c=tính cho object
        this.defineProperties();

        //Lắng nghe / xứ lý các sự kiện (cuộn trang)
        this.handleEvents();

        //Tải bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //Render playlist
        this.render();
    },

}

app.start()