const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const volumeProgress = $('#volume');
const volumeBtn = $('.volume-range i')
const volumeRanger = $('.volume-range')

const API ="https://api.apify.com/v2/key-value-stores/EJ3Ppyr2t73Ifit64/records/LATEST?fbclid=IwAR0yK8aN8clnwY2xaELCLf-0dpQWPiFRtDJeAfVPe9vaj0S7Vq_Eie0ffoM";
var data;


const app = {
    currentIndex: 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    // songs: [
    //     {
    //         title: 'Em',
    //         creator: 'Xám',
    //         music: './assets/img/Em.m4a',
    //         bgImage: './assets/img/Xám.jpg' 
    //     },
    //     {
    //         title: 'Bạn không hiểu tôi',
    //         creator: 'Tôi',
    //         music: './assets/img/Bankhonghieutoi.m4a',
    //         bgImage: './assets/img/Shisui.jpg' 
    //     },
    //     {
    //         title: 'Cho anh cho em',
    //         creator: 'Seachain',
    //         music: './assets/img/Choanhchoem.m4a',
    //         bgImage: './assets/img/seachain.png' 
    //     },
    //     {
    //         title: 'Smile',
    //         creator: 'Obito',
    //         music: './assets/img/Smile.m4a',
    //         bgImage: './assets/img/Obito.jpg' 
    //     }
    // ],

    songs : [],
    getData: function(){
        return fetch(API)
            .then(function(response){
                return response.json();
            })
            .then(function(data){
                app.songs = data.songs.top100_VN[4].songs;
                console.log(app.songs)
                return app.songs
            })
    },

    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'song--active' : ''}" data-index="${index}">
                    <div class="thumb">
                        <img src="${song.bgImage}" alt="">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.title}</h3>
                        <p class="author">${song.creator}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })

        playlist.innerHTML = htmls.join('\n')
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
                progress.value = progressPercent;

                //currentTime và duration
                
                document.querySelector('.currentTime').innerHTML= `${Math.floor(Math.floor(audio.currentTime) / 60)}:${(Math.floor(audio.currentTime) % 60)< 10 ? "0":""}${(Math.floor(audio.currentTime) % 60)}`;
                document.querySelector('.rangerTime').innerHTML=  `${Math.floor(Math.floor(audio.duration) / 60)}:${(Math.floor(audio.duration) % 60)< 10 ? "0":""}${(Math.floor(audio.duration) % 60)}`;
            }
        }        

        //Xử lý khi tua xong
        progress.onchange = function(e){
            const seeTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seeTime;
        }

        //xử lý Khi âm lượng thay đổi 
        volumeProgress.onchange = function(e){
            audio.volume = e.target.value/100;
            console.log(audio.volume)
        }

        //Xử lý khi ckick vào volume button
        volumeBtn.onclick = function(e){
            volumeRanger.classList.toggle('volume-range--active');
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
            app.scrollToActiveSong();
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
            app.scrollToActiveSong();
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

        //Xử lý khi chọn bài hát (lăng nghe hành vi click vào playlist)
        playlist.onclick = function (e) {
            //Xử lý khi click vào song
            const songNode = e.target.closest('.song:not(.song--active)');
            if (songNode || e.target.closest('.option') ){
                //Xử lý khi click vào song
                if (songNode){
                    app.currentIndex = Number(songNode.getAttribute('data-index'));
                    app.loadCurrentSong();
                    audio.play();
                    app.render();
                }
                //Xử lý khi click vào option (dấu 3 chấm ...)
                if(e.target.closest('.option')){
                    //
                }
            }
        }
    },

    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.song--active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 300)
    },

    loadCurrentSong: function(){

        heading.textContent = this.currentSong.title;
        cdThumb.src = this.currentSong.bgImage;
        audio.src = this.currentSong.music;

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
        if (this.currentIndex < 0){
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

    start: async function(){

        await this.getData(this.render); //lấy dữ liệu rồi render dữ liệu

        //Định nghĩa thuộc tính cho object
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