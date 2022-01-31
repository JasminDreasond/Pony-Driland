// Read Data on Scroll
$(window).on('resize scroll', function() {

    // Validator
    if (storyData.chapter.selected > 0) {

        // Selected Item
        let selectedItem = 0;

        // Normal Mode
        if (!tinyLib.isPageBottom()) {

            // Detect Selected Item
            for (const item in storyData.chapter.html) {

                if (storyData.chapter.html[item].visibleOnWindow() === 'full') {
                    selectedItem = Number(item);
                    break;
                }

            }

        }

        // Bottom Page
        else {
            for (const item in storyData.chapter.html) {
                selectedItem = Number(item);
            }
        }

        // Complete
        updateChapterCache(selectedItem);

    }

});

// Update Cache
var updateChapterCache = function(lastPage) {
    if (storyData.chapter.selected > 0) {

        // Update Data Cache
        musicManager.startBase();
        storyData.chapter.line = lastPage;
        const data = storyData.data[storyData.chapter.selected];
        for (const i in data) {

            // Get Data
            if (data[i].set) {
                for (const item in data[i].set) {
                    if (typeof chapterSet[item] === 'function') {
                        chapterSet[item](data[i].set[item], (i < lastPage));
                    }
                }
            }

        }

        // Add Bookmark
        if ($('#fic-nav > #status #bookmark').length < 1) {

            // Insert
            if (!storyData.chapter.nav) { storyData.chapter.nav = {}; }
            storyData.chapter.nav.bookmark = $('<a>', { indexItem: 1, class: 'nav-item nav-link', id: 'bookmark' });
            $('#fic-nav > #status').prepend(storyData.chapter.nav.bookmark);

            // Icon
            storyData.chapter.nav.bookmark.css({ 'font-size': '17pt', cursor: 'pointer' });
            storyData.chapter.nav.bookmark.attr('title', 'Bookmark').append($('<i>', { class: 'fas fa-bookmark' }));
            storyData.chapter.nav.bookmark.tooltip();

            // Action
            storyData.chapter.nav.bookmark.click(function() {

                tinyLib.modal({
                    title: $('<span>').text('Bookmark'),
                    body: $('<center>').append(
                        $('<h5>').text(`Save this URL to your favorites to re-read the story on any device`),
                        $('<input>', { type: 'text', class: 'form-control text-center' }).prop('readonly', true).val(
                            `${location.protocol}//${location.host}/?path=read-fic&title=${encodeURIComponent(storyCfg.title)}&chapter=${storyData.chapter.selected}&line=${storyData.chapter.line}`
                        ).click(function() { $(this).select(); })
                    ),
                    dialog: 'modal-lg'
                });

            });

        }

        // Sortable
        $('#fic-nav #status > a').sort(function(a, b) {
            return Number($(a).attr('indexitem')) - Number($(b).attr('indexitem'));
        }).appendTo($('#fic-nav #status'));

        // Update Title
        localStorage.setItem('bookmark' + storyData.chapter.selected, storyData.chapter.line);
        storyData.chapter.bookmark[storyData.chapter.selected] = storyData.chapter.line;
        const infoInsert = `Chapter ${storyData.chapter.selected} / Line ${storyData.chapter.line}`;
        $('#fic-chapter').text(infoInsert);
        document.title = `${storyData.title} - ${infoInsert}`;

    }
};

// Music Manager
var musicManager = {

    // Update Player
    updatePlayer: function() {

        if (storyData.music.nav) {

            $('#music-player').addClass('border').removeClass('d-none').addClass('mr-3');

            if (storyData.music.playing) {
                storyData.music.nav.play.addClass('fa-pause').removeClass('fa-play');
            } else if (storyData.music.paused || storyData.music.stoppabled) {
                storyData.music.nav.play.addClass('fa-play').removeClass('fa-pause');
            }

        }

    },

    // Start Base
    startBase: function() {

        // Add Item Base
        if ($('#fic-nav > #status #music').length < 1) {

            // Navbar
            if (!storyData.music.nav) { storyData.music.nav = {}; }

            // Info
            storyData.music.nav.info = $('<i>', { class: 'fas fa-info-circle' }).click(function() {
                console.log(storyData.youtube.player.getVideoUrl());
            });

            // Play
            storyData.music.nav.play = $('<i>', { class: 'fas fa-play' }).click(function() {

                if (storyData.youtube.state === YT.PlayerState.PLAYING) {
                    storyData.youtube.player.pauseVideo();
                } else {
                    storyData.youtube.player.playVideo();
                }

            });

            // Stop
            storyData.music.nav.stop = $('<i>', { class: 'fas fa-stop' }).click(function() {
                storyData.youtube.player.stopVideo();
                storyData.music.nav.play.addClass('fa-play').removeClass('fa-pause');
                storyData.music.stoppabled = true;
            });

            // Prepare
            if (!storyData.chapter.nav) { storyData.chapter.nav = {}; }
            storyData.chapter.nav.music = $('<div>', { indexItem: 0, class: 'nav-item', id: 'music' }).append(
                $('<div>', { id: 'music-player', class: 'd-none' }).append(
                    $('<a>', { href: 'javascript:void(0)' }).append(storyData.music.nav.info),
                    $('<a>', { href: 'javascript:void(0)' }).append(storyData.music.nav.play),
                    $('<a>', { href: 'javascript:void(0)' }).append(storyData.music.nav.stop)
                )
            );

            // Add Playing Detector
            appData.youtube.onPlaying = function() {
                //console.log(storyData.youtube.currentTime);
            };

            // Insert
            $('#fic-nav > #status').prepend(storyData.chapter.nav.music);

        }

    },

    // Play Music
    play: function(value) {



    }

};

// Set Actions
var chapterSet = {

    musicPlay: function(value, actionFromNow = false) {
        if (actionFromNow) {
            musicManager.play(value);
        }
    },

    day: function(value, actionFromNow = false) {
        if (actionFromNow) {

            // Add Item Base
            if ($('#fic-nav > #status #day').length < 1) {
                if (!storyData.chapter.nav) { storyData.chapter.nav = {}; }
                storyData.chapter.nav.day = $('<a>', { indexItem: 4, class: 'nav-item nav-link', id: 'day' });
                $('#fic-nav > #status').prepend(storyData.chapter.nav.day);
            }

            $('#fic-nav > #status #day').text(`Day: ${value}`);

        }
    },

    dayNightCycle: function(value, actionFromNow = false) {
        if (actionFromNow) {

            // Add Item Base
            if ($('#fic-nav > #status #dayNightCycle').length < 1) {
                if (!storyData.chapter.nav) { storyData.chapter.nav = {}; }
                storyData.chapter.nav.dayNightCycle = $('<a>', { indexItem: 3, class: 'nav-item nav-link', id: 'dayNightCycle' });
                $('#fic-nav > #status').prepend(storyData.chapter.nav.dayNightCycle);
            }

            // Types
            const types = {
                morning: { icon: 'fas fa-sun', title: 'Morning' },
                evening: { icon: 'cloud-sun', title: 'Evening' },
                night: { icon: 'fas fa-moon', title: 'Night' },
                lateAtNigh: { icon: 'fas fa-bullseye', title: 'Late at Nigh' }
            };

            const obj = $('#fic-nav > #status #dayNightCycle').css('font-size', '17pt');
            obj.empty();
            if (types[value]) {
                obj.attr('title', types[value].title).append($('<i>', { class: types[value].icon }));
                obj.tooltip();
                obj.removeAttr('title');
            }

        }
    },

    weather: function(value, actionFromNow = false) {
        if (actionFromNow) {

            // Add Item Base
            if ($('#fic-nav > #status #weather').length < 1) {
                if (!storyData.chapter.nav) { storyData.chapter.nav = {}; }
                storyData.chapter.nav.weather = $('<a>', { indexItem: 2, class: 'nav-item nav-link', id: 'weather' });
                $('#fic-nav > #status').prepend(storyData.chapter.nav.weather);
            }

            // Types
            const types = {
                rain: { icon: 'fas fa-cloud-rain', title: 'Rain' },
                bolt: { icon: 'fas fa-bolt', title: 'Thunderbolt' },
                heavyrain: { icon: 'fas fa-cloud-showers-heavy', title: 'Heavy Rain' },
                snow: { icon: 'fas fa-snowflake', title: 'Snow' }
            };

            const obj = $('#fic-nav > #status #weather').css('font-size', '17pt');
            obj.empty();
            if (types[value]) {
                obj.attr('title', types[value].title).append($('<i>', { class: types[value].icon }));
                obj.tooltip();
                obj.removeAttr('title');
            }

        }
    },

    where: function(value, actionFromNow = false) {
        if (actionFromNow) {

            // Add Item Base
            if ($('#fic-nav > #status #where').length < 1) {
                if (!storyData.chapter.nav) { storyData.chapter.nav = {}; }
                storyData.chapter.nav.where = $('<a>', { indexItem: 5, class: 'nav-item nav-link', id: 'where' });
                $('#fic-nav > #status').prepend(storyData.chapter.nav.where);
            }

            $('#fic-nav > #status #where').text(`Location: ${value}`);

        }
    }

};