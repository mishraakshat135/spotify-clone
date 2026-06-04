

let currentSong = new Audio();
let songs;
let currFolder;

function secToMinSec(sec) {
    if (isNaN(sec) || sec < 0) {
        return "00:00";
    }

    const min = Math.floor(sec / 60)
    const remainingSec = Math.floor(sec % 60);
    const formattedMin = String(min).padStart(2, '0');
    const formattedSec = String(remainingSec).padStart(2, '0');
    return `${formattedMin}:${formattedSec}`
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`/${folder}/tracks.json`);
    let data = await response.json()
    
    
    songs = data.songs;
    
    


    let songUL = document.querySelector(".songList ul")
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="musicImg" src="icons/music.svg">
                            <div class="info">
                                <div>${song}
                                </div>
                                <div>Track</div>
                            </div>
                            <img class="playFromLib" src="icons/play.svg">
                        </li>`;
    }

    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

            resumeSong.src = "icons/pause.svg"
        })

    })

    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    let response = await fetch(`/songs/songs.json`);
    let data = await response.json();

    
 

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTMl = "";
    for (const folder of data.albums) {
        
        
        
            let res = await fetch(`/songs/${folder}/info.json`);
            let info = await res.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div>
                        <img  class="play" src="icons/play-btn.png" alt="play">
                        <img class="image" src="/songs/${folder}/cover.jpg" alt="playlist">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div></div>`
        }
    

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            
            

        })
    })

    Array.from(document.getElementsByClassName("play")).forEach(btn => {
        btn.addEventListener("click", async (e) =>{
            e.stopPropagation()
            let card = e.target.closest(".card");
            let folder = card.dataset.folder;
            await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
            resumeSong.src = "icons/pause.svg";
        })
    })

}

async function main() {


    await getSongs("songs/dhurandhar")
    playMusic(songs[0], true)

    displayAlbums();

    resumeSong.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            resumeSong.src = "icons/pause.svg"
        }
        else {
            currentSong.pause();
            resumeSong.src = "icons/play.svg"
        }
    })


    currentSong.addEventListener("timeupdate", () => {
      
        document.querySelector(".songTime").innerHTML = `${secToMinSec(currentSong.currentTime)} / ${secToMinSec(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".closeHamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })

    // prevSong.addEventListener("click",()=>{
    //     let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    //     playMusic(songs[index])
    //     resumeSong.src="pause.svg"
    // })

    prevSong.addEventListener("click", () => {
        let currentTrack =decodeURIComponent(
            currentSong.src.split("/").pop()
        )
        let index = songs.indexOf(currentTrack);

        if (currentSong.currentTime > 3)
            currentSong.currentTime = 0;
        else {
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1])
                resumeSong.src = "icons/pause.svg"
            }
            else {
                playMusic(songs[songs.length - 1])
                resumeSong.src = "icons/pause.svg"
            }
        }
    })

    nextSong.addEventListener("click", () => {
        let currentTrack =decodeURIComponent(
            currentSong.src.split("/").pop()
        )
        let index = songs.indexOf(currentTrack);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
            resumeSong.src = "icons/pause.svg"
        }
        else {
            playMusic(songs[0])
            resumeSong.src = "icons/pause.svg";
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (parseInt(e.target.value) / 100 == 0)
            volIcon.src = "icons/mute.svg"
        else if (parseInt(e.target.value) / 100 > 0)
            volIcon.src = "icons/volume.svg"


    })

    volIcon.addEventListener("click", () => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            volIcon.src = "icons/mute.svg";
            document.querySelector(".volRange").value = 0;

        }
        else {
            currentSong.volume = 0.5;
            volIcon.src = "icons/volume.svg"
            document.querySelector(".volRange").value = 50;
        }
    })

    document.addEventListener("keydown", e =>{
        if(e.key === " ")
        {
            e.preventDefault();
            if(currentSong.paused)
            {
                currentSong.play();
                resumeSong.src = "icons/pause.svg";
            }
            else{
                currentSong.pause();
                resumeSong.src = "icons/play.svg"

            }
        }

        
        else if(e.code === "ArrowUp")
        {
            
            e.preventDefault();
            currentSong.volume = Math.min(1, currentSong.volume + 0.1);
            document.querySelector(".volRange").value= currentSong.volume *100;
            if(currentSong.volume>0)
                volIcon.src="icons/volume.svg"
        }

        else if(e.code === "ArrowDown")
        {
            e.preventDefault();
            currentSong.volume =Math.max(0, currentSong.volume - 0.1);
            document.querySelector(".volRange").value = currentSong.volume * 100;
            if(currentSong.volume==0)
            {
                volIcon.src="icons/mute.svg";
            }
        }
    })

   


}


main()