// Base
storyData.music = {

    value: null,
    now: { playlist: null, index: -1 },
    usingSystem: false,
    disabled: true,
    playing: false,
    paused: false,
    stoppabled: true,
    buffering: false,
    volume: 0,
    playlist: []

};

// Youtube Player
storyData.youtube = {

    // Volume
    volume: storyCfg.defaultYoutubeVolume,
    quality: null,
    state: null,
    embed: null,

    // Player
    player: null,
    events: {

        // Ready API
        onReady: function(event) {

            // Get Data
            storyData.youtube.volume = storyData.youtube.player.getVolume();
            storyData.youtube.quality = storyData.youtube.player.getPlaybackQuality();
            storyData.youtube.qualityList = storyData.youtube.player.getAvailableQualityLevels();

            // Storage Volume
            const storageVolume = Number(localStorage.getItem('storyVolume'));
            if (isNaN(storageVolume) || !isFinite(storageVolume) || storageVolume < 0 || storageVolume > 100) {
                if (storyData.youtube.volume < 1) {
                    storyData.youtube.volume = 100;
                    storyData.youtube.player.setVolume(100);
                    localStorage.setItem('storyVolume', 100);
                    storyData.music.volume = 100;
                } else { localStorage.setItem('storyVolume', storyData.youtube.volume); }
            } else {
                storyData.youtube.volume = storageVolume;
                storyData.youtube.player.setVolume(storageVolume);
                storyData.music.volume = storageVolume;
            }

            // Play Video
            storyData.youtube.player.seekTo(0);
            storyData.youtube.player.setLoop(true);
            storyData.youtube.player.setShuffle(true);
            storyData.youtube.player.playVideo();

            // Send Data
            if (typeof appData.youtube.onReady === 'function') { appData.youtube.onReady(event); }

        },

        // State Change
        onStateChange: function(event) {

            // Event
            if (event) {
                storyData.youtube.state = event.data;
                storyData.youtube.qualityList = storyData.youtube.player.getAvailableQualityLevels();
            }

            // Send Data
            if (typeof appData.youtube.onStateChange === 'function') { appData.youtube.onStateChange(event); }

        },

        // Quality
        onPlaybackQualityChange: function(event) {
            if (event) { storyData.youtube.quality = event.data; }
            if (typeof appData.youtube.onPlaybackQualityChange === 'function') { appData.youtube.onPlaybackQualityChange(event); }
            /* player.setPlaybackQuality('default') */
        },

        // Other
        onPlaybackRateChange: function(event) {
            if (typeof appData.youtube.onPlaybackRateChange === 'function') { appData.youtube.onPlaybackRateChange(event); }
        },

        onError: function(event) {
            console.error(event);
            if (typeof appData.youtube.onError === 'function') { appData.youtube.onError(event); }
        },

        onApiChange: function(event) {
            if (typeof appData.youtube.onApiChange === 'function') { appData.youtube.onApiChange(event); }
        }

    },

    // Quality
    setQuality: function(value) {
        if (storyData.youtube.qualityList.indexOf(value) > -1 || value === 'default') {
            storyData.youtube.quality = value;
            storyData.youtube.player.setPlaybackQuality(value);
            return true;
        } else { return false; }
    },

    // Volume
    setVolume: function(number) {
        localStorage.setItem('storyVolume', Number(number));
        storyData.youtube.volume = Number(number);
        storyData.youtube.player.setVolume(Number(number));
        storyData.music.volume = Number(number);
    },

    // Start Youtube
    play: function(videoID) {

        // Read Data Base
        console.log(`Loading youtube video embed...`);
        $.ajax({
            url: 'https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(`https://www.youtube.com/watch?v=` + videoID),
            type: 'get',
            dataType: 'json'
        }).done(function(jsonVideo) {

            // Youtube Player
            console.log(`Youtube video embed loaded!`);
            storyData.youtube.embed = jsonVideo;

            // Info
            storyData.music.author_name = jsonVideo.author_name;
            storyData.music.author_url = jsonVideo.author_url;
            storyData.music.provider_name = jsonVideo.provider_name;
            storyData.music.thumbnail_url = jsonVideo.thumbnail_url;
            storyData.music.title = jsonVideo.title;

            // Prepare Video ID
            storyData.youtube.videoID = videoID;
            storyData.youtube.currentTime = 0;
            storyData.youtube.duration = 0;

            // New Player
            if (!storyData.youtube.player) {

                // 2. This code loads the IFrame Player API code asynchronously.
                console.log(`Starting Youtube API...`);
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                $('head').append(tag);

                // Current Time Detector
                setInterval(function() {
                    if (YT && YT.PlayerState && storyData.youtube.player) {

                        // Fix
                        storyData.music.playing = false;
                        storyData.music.paused = false;
                        storyData.music.stoppabled = false;
                        storyData.music.buffering = false;

                        // Playing
                        if (storyData.youtube.state === YT.PlayerState.PLAYING) {
                            storyData.music.playing = true;
                            storyData.youtube.duration = storyData.youtube.player.getDuration();
                            storyData.youtube.currentTime = storyData.youtube.player.getCurrentTime();
                            if (typeof appData.youtube.onPlaying === 'function') { appData.youtube.onPlaying(); }
                        }

                        // Ended
                        else if (storyData.youtube.state === YT.PlayerState.ENDED || storyData.youtube.state === YT.PlayerState.CUED) {
                            storyData.youtube.player.seekTo(0);
                            storyData.youtube.player.pauseVideo();
                            storyData.music.stoppabled = true;
                            storyData.youtube.currentTime = storyData.youtube.player.getDuration();
                        }

                        // Paused
                        else if (storyData.youtube.state === YT.PlayerState.PAUSED) {
                            storyData.music.paused = true;
                        }

                        // Buff
                        else if (storyData.youtube.state === YT.PlayerState.BUFFERING) {
                            storyData.music.buffering = true;
                        }

                    }
                    musicManager.updatePlayer();
                }, 100);

            }

            // Reuse Player
            else { storyData.youtube.player.loadVideoById({ videoId: videoID, startSeconds: 0 }); }

            // Prepare Volume
            if (typeof storyData.youtube.volume === 'number' && typeof storyData.music.volume === 'number' && storyData.youtube.volume !== storyData.music.volume) {
                storyData.youtube.player.setVolume(storyData.youtube.volume);
                storyData.music.volume = Number(storyData.youtube.volume);
            }

        }).fail(err => {
            console.error(err);
            alert(err.message);
        });

    }

};

// Music Manager
var musicManager = {

    disable: function(react = true) {
        if (react) {
            storyData.music.disabled = true;
            $('#music-player').addClass('disabled-player');
        } else {
            storyData.music.disabled = false;
            $('#music-player').removeClass('disabled-player');
        }
    },

    // Start Base
    startBase: function() {

        // Add Youtube Playing Detector
        if (appData.youtube && !appData.youtube.onPlaying) {
            appData.youtube.onPlaying = function() {
                storyData.music.currentTime = storyData.youtube.currentTime;
                storyData.music.duration = storyData.youtube.duration;
                musicManager.updatePlayer();
            };
        }

        // Add Item Base
        if ($('#fic-nav > #status #music').length < 1) {

            // Navbar
            if (!storyData.music.nav) { storyData.music.nav = {}; }

            // Buttons
            storyData.music.nav.info = $('<i>', { class: 'fas fa-info-circle' });
            storyData.music.nav.play = $('<i>', { class: 'fas fa-play' });
            storyData.music.nav.volume = $('<i>', { class: 'fas fa-volume-mute' });
            storyData.music.nav.stop = $('<i>', { class: 'fas fa-stop' });
            storyData.music.nav.disable = $('<i>', { class: 'fas fa-ban' });

            // Prepare
            if (!storyData.chapter.nav) { storyData.chapter.nav = {}; }
            storyData.chapter.nav.music = $('<div>', { indexItem: 0, class: 'nav-item', id: 'music' }).append(
                $('<div>', { id: 'music-player', class: 'd-none' }).append(

                    // Info
                    $('<a>', { href: 'javascript:void(0)', title: 'Source' }).click(function() {
                        open(storyData.youtube.player.getVideoUrl(), '_blank');
                    }).append(storyData.music.nav.info),

                    // Play
                    $('<a>', { href: 'javascript:void(0)', title: 'Play/Pause' }).click(function() {

                        if (storyData.youtube.state === YT.PlayerState.PLAYING) {
                            storyData.youtube.player.pauseVideo();
                        } else {
                            storyData.youtube.player.playVideo();
                        }

                    }).append(storyData.music.nav.play),

                    // Stop
                    $('<a>', { href: 'javascript:void(0)', title: 'Stop' }).click(function() {
                        storyData.youtube.player.stopVideo();
                    }).append(storyData.music.nav.stop),

                    // Volume
                    $('<a>', { href: 'javascript:void(0)', title: 'Volume' }).click(function() {

                        // Modal
                        tinyLib.modal({
                            title: [$('<i>', { class: 'fas fa-volume mr-3' }), 'Song Volume'],
                            body: $('<center>').append(
                                $('<p>').text('Change the page music volume'),
                                $('<input>', { class: 'form-control range', type: 'range', min: 0, max: 100 }).change(function() {
                                    storyData.youtube.setVolume($(this).val());
                                }).val(storyData.music.volume)
                            ),
                            dialog: 'modal-lg'
                        });

                    }).append(storyData.music.nav.volume),

                    // Disable
                    $('<a>', { href: 'javascript:void(0)', title: 'Disable' }).click(function() {
                        $(this).removeClass('');
                        if (storyData.music.useThis) {
                            storyData.music.useThis = false;
                            storyData.music.nav.disable.removeClass('text-danger');
                        } else {
                            storyData.music.useThis = true;
                            storyData.music.nav.disable.addClass('text-danger');
                        }
                    }).append(storyData.music.nav.disable),

                )
            );

            // Insert
            $('#fic-nav > #status').prepend(storyData.chapter.nav.music);

        }

    }

};

// Youtube

// 1. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
// https://developers.google.com/youtube/iframe_api_reference?hl=pt-br
function onYouTubeIframeAPIReady() {
    console.log(`Youtube API started!`);
    storyData.youtube.player = new YT.Player('youtubePlayer', {
        height: 'auto',
        width: 'auto',
        playerVars: { controls: 0 },
        videoId: storyData.youtube.videoID,
        startSeconds: 0,
        events: storyData.youtube.events
    });
};

/* 

    Music
    storyData.youtube.play('vwsRv0Rqncw')

*/

// Music Updater
musicManager.updatePlayer = function() {

    if (storyData.music.nav) {

        // View
        $('#music-player').addClass('border').removeClass('d-none').addClass('mr-3');

        // Buff
        if (storyData.music.buffering) {
            $('#music-player > a').addClass('disabled');
        } else {
            $('#music-player > a').removeClass('disabled');
        }

        // Title
        if (typeof storyData.music.title === 'string' && storyData.music.title.length > 0) {
            $('#music-player > a').has(storyData.music.nav.info).attr('data-original-title', `Youtube - ${storyData.music.author_name} - ${storyData.music.title}`);
        }

        // Playing
        if (storyData.music.playing) {
            storyData.music.nav.play.addClass('fa-pause').removeClass('fa-play');
        } else if (storyData.music.paused) {
            storyData.music.nav.play.addClass('fa-play').removeClass('fa-pause');
        } else if (
            storyData.music.stoppabled ||
            typeof storyData.music.currentTime !== 'number' || typeof storyData.music.duration !== 'number' ||
            storyData.music.currentTime === storyData.music.duration
        ) {
            storyData.music.nav.play.addClass('fa-play').removeClass('fa-pause');
        }

        // Volume
        storyData.music.nav.volume.removeClass('fa-volume-mute').removeClass('fa-volume-up');
        if (typeof storyData.music.volume === 'number' && storyData.music.volume > 0) {
            storyData.music.nav.volume.addClass('fa-volume-up');
        } else {
            storyData.music.nav.volume.addClass('fas fa-volume-mute');
        }

        // Tooltip
        $('#music-player > a[title]').each(function() {
            $(this).tooltip();
        });

    }

};

// Stop Playlist
musicManager.stopPlaylist = function() {
    if (storyData.music.usingSystem) {

        if (storyData.music.playing) {
            storyData.music.playingUsed = true;
        }

        storyData.music.usingSystem = false;
        if (storyData.youtube.player) {
            storyData.youtube.player.stopVideo();
        }

    }
};

// Start Playlist
musicManager.startPlaylist = function() {
    if (!storyData.music.usingSystem) {

        // Check Status
        if (Array.isArray(storyData.music.playlist) && storyData.music.playlist.length > 0) {

            // Play Song
            const playSong = function() {
                if (typeof storyData.music.now.index === 'number' && !isNaN(storyData.music.now.index) && isFinite(storyData.music.now.index) && storyData.music.now.index > -1) {

                    // Play
                    const song = storyData.music.playlist[storyData.music.now.index];
                    if (song && typeof song.id === 'string' && song.id.length > 0 && typeof song.type === 'string' && song.type.length > 0) {

                        // Youtube
                        if (song.type === 'youtube') {
                            storyData.youtube.play(song.id);
                            console.log(song);
                        }

                    }

                }
            };

            // Exist
            if (
                storyData.music.now.playlist === null ||
                storyData.music.now.index === -1 ||
                storyData.music.now.playlist !== storyData.music.value
            ) {

                // Fix Index
                if (storyData.music.now.index < 0) {
                    storyData.music.now.index = 0;
                }

                // Now
                storyData.music.now.playlist = storyData.music.value;

                // Play
                playSong();

            }

            // Resume
            else if (storyData.music.playingUsed) {

                if (storyData.music.playingUsed) {
                    playSong();
                }

                storyData.music.playingUsed = false;

            }

        }

        // Check Data
        storyData.music.usingSystem = true;
        //console.log(storyData.music.playlist);

    }
};