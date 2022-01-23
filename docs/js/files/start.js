// Start Load
var appData = { youtube: {} };

// Start Document
console.groupCollapsed('App Information');
console.log(`Name: ${storyCfg.title}`);
console.log(`Description: ${storyCfg.description}`);
console.log(`Author: ${storyCfg.creator}`);
console.log(`Author Page: ${storyCfg.creator_url}`);
console.log(`Age Rating: ${storyCfg.ageRating}`);
console.log(`NFT Domain: ${storyCfg.nftDomain.value}`);
console.log(`NFT Domain Provider: ${storyCfg.nftDomain.name}`);
console.log(`Github Repository: https://github.com/${storyCfg.github.account}/${storyCfg.github.repository}`);
console.log(`Tags`, storyCfg.tags);
console.log(`NSFW`, true);
console.groupEnd();

// URL Update
var urlUpdate = function(url, title, isPopState = false) {

    // Page Title
    if (typeof title !== 'string' || title.length < 1) { title = storyCfg.title; }
    document.title = title;

    // Pop State
    if (!isPopState) {
        if (typeof url === 'string' && url.length > 0) {
            window.history.pushState({ "pageTitle": title }, "", '/?path=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title));
        } else {
            window.history.pushState({ "pageTitle": title }, "", '/');
        }
    }

};

var openNewAddress = function(data, isPopState = false) {

    if (!data || typeof data.path !== 'string' || data.path.length < 1 || !data.path.startsWith('/') || data.path.indexOf('http://') > -1 || data.path.indexOf('https://') > -1) {
        insertMarkdownFile(storyData.readme);
    } else {
        openMDFIle(data.path);
        if (typeof data.title === 'string' && data.title.length > 0) {
            urlUpdate(data.path, data.title, isPopState);
        } else {
            urlUpdate(data.path, null, isPopState);
        }
    }

};

$(window).on('popstate', function() {
    const urlSearchParams = new URLSearchParams(document.location.search);
    openNewAddress(Object.fromEntries(urlSearchParams.entries()), true);
});

// Insert Maarkdown File
var insertMarkdownFile = function(text) {

    // Prepare Convert Base
    const convertBase = `https\\:\\/\\/github.com\\/${storyCfg.github.account}\\/${storyCfg.github.repository}\\/blob\\/main\\/`;

    // Convert Data
    const data = marked.parse(text)
        .replace(new RegExp(`href\=\"${convertBase}docs\\/`, 'g'), 'href="javascript:void(0)" file="/')
        .replace(new RegExp(`src\=\"${convertBase}docs\\/`, 'g'), 'src="/');

    // Insert Data
    $('#markdown-read').empty().html(data);

    // Convert File URLs
    $('[id="markdown-read"] a[file]').removeAttr('target').click(function() {
        openMDFIle($(this).attr('file'));
        urlUpdate($(this).attr('file'), $(this).text().trim());
    });

    // Fix Image
    $('[id="markdown-read"] img').each(function() {
        if ($(this).parents('a').length < 1) {

            // New Image Item
            const src = $(this).attr('src');
            const newImage = $('<img>', { class: 'img-fluid' }).css('height', $(this).attr('height')).css('width', $(this).attr('width'));
            $(this).replaceWith(newImage);

            // Load Image FIle
            var pswpElement = document.querySelectorAll('.pswp')[0];
            newImage.css({
                'cursor': 'pointer',
                'opacity': '0%',
                'pointer-events': ''
            }).on('load', function() {

                const newImg = new Image();
                const tinyThis = $(this);

                newImg.onload = function() {
                    tinyThis.data('image-size', { width: this.width, height: this.height });
                    tinyThis.css({ 'opacity': '100%', 'pointer-events': '' });
                }

                newImg.src = $(this).attr('src');

            }).click(function() {
                const imgSize = $(this).data('image-size');
                var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, [{ src: $(this).attr('src'), h: imgSize.height, w: imgSize.width }], { index: 0 });
                gallery.init();
                $(this).fadeTo("fast", 0.7, function() {
                    $(this).fadeTo("fast", 1);
                });
                return false;
            }).hover(function() {
                $(this).fadeTo("fast", 0.8);
            }, function() {
                $(this).fadeTo("fast", 1);
            });

            // Load Image
            newImage.attr('src', src);

            const newTinyPlace = $('<p>', { class: 'mt-4' });
            newTinyPlace.insertAfter(newImage);

        }
    });

};

// Open MD FIle
var openMDFIle = function(url) {

    // Read Data Base
    console.log(`Opening MD file "${url}"...`);
    $.LoadingOverlay("show", { background: "rgba(0,0,0, 0.5)" });

    $.ajax({
        url: url,
        type: 'get',
        dataType: 'text'
    }).done(function(fileData) {
        console.log(`MD File opened successfully!`);
        insertMarkdownFile(fileData);
        tinyLib.goToByScrollTop(0);
        $.LoadingOverlay("hide");
    }).fail(err => {
        $.LoadingOverlay("hide");
        console.error(err);
        alert(err.message);
    });

};

// Start App
$(function() {
    console.log('Starting App...');
    storyData.start(function(fn, readme) {

        // Custom Colors
        $('head').append(
            $('<style>', { id: 'custom_color' }).text(`

            .alert .close span{
                color: ${storyCfg.theme.color4} !important;
            }
            
            .alert .close, .alert .close:hover{
                color: ${storyCfg.theme.color} !important;
            }
            
            
            .navbar-dark.bg-dark, #navTopPage {
                background-color: ${storyCfg.theme.primary} !important;
            }
            
            .navbar-dark .navbar-nav .nav-link {
                color: ${storyCfg.theme.color} !important;
            }
            
            .navbar-dark .navbar-nav .nav-link:hover {
                color: ${storyCfg.theme.color2} !important;
            }
            
            
            #sidebar {
                background: ${storyCfg.theme.secondary};
                color: ${storyCfg.theme.color3};
            }
            
            #sidebar .sidebar-header {
                background: ${storyCfg.theme.primary};
                color: ${storyCfg.theme.color};
            }
            
            #sidebar ul p {
                color: ${storyCfg.theme.color};
            }
            
            #sidebar ul li a:hover {
                color: ${storyCfg.theme.color};
                background: ${storyCfg.theme.primary};
            }
            
            #sidebar ul li.active > a, #sidebar a[aria-expanded="true"] {
                color: ${storyCfg.theme.color};
                background: ${storyCfg.theme.primary};
            }
            
            
            .tcat, #footer2{
                color: ${storyCfg.theme.color} !important;
                background-color: ${storyCfg.theme.secondary} !important;
            }
            
            .tcat, #footer2 a:hover{
                color: ${storyCfg.theme.color2} !important;
            }
            
            
            #footer, .modal.fade .modal-header, .thead, .page-footer, .comment-header{
                color: ${storyCfg.theme.color} !important;
                background-color: ${storyCfg.theme.primary} !important
            }
            
            .page-footer a:hover, .page-footer a:hover, #sidebar a {
                color: ${storyCfg.theme.color2} !important;
            }
            
            .thead a{
                color: ${storyCfg.theme.color} !important;
            }
            
            .thead a:hover{
                color: ${storyCfg.theme.color2} !important;
            }
            
            
            .nav-pills .nav-link.active, .nav-pills .show>.nav-link {
                color: ${storyCfg.theme.color} !important;
                background-color: ${storyCfg.theme.primary} !important;
            }
            
            .nav-pills .show>.nav-link:hover {
                color: ${storyCfg.theme.color2} !important;
            }
            
            .page-footer a, #sidebar a {
                color: ${storyCfg.theme.color} !important;
            }
            
            
            
            
            
            .dropdown-item.active, .dropdown-item:active {
                color: ${storyCfg.theme.color};
                background-color: ${storyCfg.theme.secondary}; 
            }
            
            .nav-pills .nav-link.active,
            .nav-pills .show > .nav-link {
                color: ${storyCfg.theme.color};
                background-color: ${storyCfg.theme.secondary}; 
            }
            
            `)
        );

        // Readme
        storyData.readme = readme;

        // Insert CID
        $('#info-base').append(
            $('<br/>'),
            $('<small>').text('CID: ' + storyData.cid),
            $('<br/>'),
            $('<small>').append(
                $('<span>').text('CID32: '),
                $('<a>', { href: `https://${storyData.cid32}.ipfs.dweb.link/` }).text(storyData.cid32)
            )
        );

        // Insert Navbar
        $('body').prepend(

            // Navbar
            $('<nav>', { class: 'navbar navbar-expand-lg navbar-dark bg-dark fixed-top', id: 'md-navbar' }).append(

                // Title
                $('<a>', { class: 'navbar-brand' }).text(storyCfg.title),

                // Button
                $('<button>', { class: 'navbar-toggler', type: 'button', 'data-toggle': 'collapse', 'data-target': '#mdMenu', 'aria-controls': '#mdMenu', 'aria-expanded': false }).append(
                    $('<span>', { 'class': 'navbar-toggler-icon' })
                ),

                // Collapse
                $('<div>', { class: 'collapse navbar-collapse', id: 'mdMenu' }).append(
                    $('<div>', { class: 'navbar-nav' }).append(

                        // Homepage
                        $('<a>', { class: 'nav-item nav-link', href: 'javascript:void(0)' }).text('Homepage').prepend(
                            $('<i>', { class: 'fas fa-home mr-2' })
                        ).click(function() {
                            openMDFIle('/README.md');
                            urlUpdate();
                        }),

                        // LICENSE
                        $('<a>', { class: 'nav-item nav-link', href: 'javascript:void(0)' }).text('License').prepend(
                            $('<i>', { class: 'fas fa-copyright mr-2' })
                        ).click(function() {
                            openMDFIle('/LICENSE.md');
                            urlUpdate('/LICENSE.md', 'License');
                        }),

                        // Read Fanfic
                        /* $('<a>', { class: 'nav-item nav-link', href: 'javascript:void(0)' }).text('Read').prepend(
                            $('<i>', { class: 'fab fa-readme mr-2' })
                        ).click(openChapterMenu) */

                    )
                )

            )

        );

        // Insert Readme
        $('#app').append(

            // Content
            $('<div>', { id: 'markdown-read', class: 'container' })
        );

        // Insert Footer
        $('body').append(
            $('<footer>', { class: 'page-footer font-small pt-4 clearfix' }).append(

                // Base
                $('<div>', { class: 'container-fluid text-center text-md-left' }).append(
                    $('<div>', { class: 'row' }).append(

                        // Logo
                        $('<div>', { class: 'col-md-6 mt-md-0 mt-3' }).append(
                            $('<center>').append(
                                $('<img>', { class: 'img-fluid', src: '/img/logo.png' }),
                                $('<br/>')
                            )
                        ),

                        // Links 1
                        $('<div>', { class: 'col-md-3 mb-md-0 mb-3' }).append(
                            $('<h5>').text('Links'),
                            $('<ul>', { class: 'list-unstyled' }).append(

                                $('<li>').append(
                                    $('<a>', { target: '_blank', href: `https://opensea.io/collection/${storyCfg.opensea}` }).text('OpenSea').prepend(
                                        $('<i>', { class: 'fab fa-ethereum mr-2' })
                                    )
                                ),

                                $('<li>').append(
                                    $('<a>', { href: `https://${storyData.cid32}.ipfs.dweb.link/` }).text('IPFS ' + storyCfg.nftDomain.name).prepend(
                                        $('<i>', { class: 'fas fa-wifi mr-2' })
                                    )
                                )

                            )
                        ),

                        // Links 2
                        $('<div>', { class: 'col-md-3 mb-md-0 mb-3' }).append(
                            $('<h5>').text('Links'),
                            $('<ul>', { class: 'list-unstyled' }).append(

                                $('<li>').append(
                                    $('<a>', { target: '_blank', href: storyCfg.nftDomain.url.replace('{domain}', storyCfg.nftDomain.valueURL) }).text(storyCfg.nftDomain.name).prepend(
                                        $('<i>', { class: 'fas fa-marker mr-2' })
                                    ),
                                ),
                                $('<li>').append(
                                    $('<a>', { target: '_blank', href: `https://github.com/${storyCfg.github.account}/${storyCfg.github.repository}` }).text('Github').prepend(
                                        $('<i>', { class: 'fab fa-github mr-2' })
                                    ),
                                ),
                                $('<li>').append(
                                    $('<a>', { target: '_blank', href: 'mailto:' + storyCfg.contact }).text('Contact').prepend(
                                        $('<i>', { class: 'fas fa-envelope mr-2' })
                                    )
                                )

                            )
                        )

                    )
                ),

                // Copyright
                $('<div>', { id: 'footer2', class: 'footer-copyright text-center py-3 bg-secondary text-white' })
                .text(`© ${storyCfg.year} ${storyCfg.title} | `).append(
                    $('<a>', { target: '_blank', href: storyCfg.creator_url }).text(storyCfg.creator),
                    '.'
                )

            )
        );

        // Start Readme
        openNewAddress(params, true);

        // Complete
        console.log(storyData);
        $('#under-development').modal();
        fn();

    });
});

/* 

    Music
    storyData.youtube.play('vwsRv0Rqncw')
    storyData.youtube.player.playVideo()
    storyData.youtube.player.pauseVideo()
    storyData.youtube.player.stopVideo()

    storyData.youtube.player.mute()
    storyData.youtube.player.unMute()
    storyData.youtube.player.isMuted()

    storyData.youtube.player.setVolume(100)

    player.getDuration()
    player.getVideoUrl()

    appData.youtube.onPlaying = function() {
        console.log(storyData.youtube.currentTime);
    };

*/