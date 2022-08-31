// Start Load
var appData = { youtube: {} };

// Start Document
console.groupCollapsed('App Information');
console.log(`Fanfic Engine Creator: Yasmin Seidel (JasminDreasond) https://github.com/JasminDreasond`);
console.log(`Name: ${storyCfg.title}`);
console.log(`Description: ${storyCfg.description}`);
console.log(`Author: ${storyCfg.creator}`);
console.log(`Author Page: ${storyCfg.creator_url}`);
console.log(`Age Rating: ${storyCfg.ageRating}`);
console.log(`NFT Domain: ${storyCfg.nftDomain.value}`);
console.log(`NFT Domain Provider: ${storyCfg.nftDomain.name}`);
console.log(`Github Repository: https://github.com/${storyCfg.github.account}/${storyCfg.github.repository}`);
console.log(`Tags`, storyCfg.tags);
console.groupEnd();

// URL Update
var urlUpdate = function (url, title, isPopState = false) {

    // Page Title
    if (typeof title !== 'string' || title.length < 1) { title = storyCfg.title; }
    document.title = title;
    storyData.urlPage = url;

    // Google
    if (typeof storyCfg.gtag === 'string' && gtag) {
        gtag('event', 'url', {
            event_title: title,
            event_category: 'open_url',
            url: url
        });
    }

    // Pop State
    if (!isPopState) {
        if (typeof url === 'string' && url.length > 0) {
            if (!storyCfg.custom_url[url]) {
                window.history.pushState({ "pageTitle": title }, "", '/?path=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title));
            } else {
                window.history.pushState({ "pageTitle": storyCfg.custom_url[url].title }, "", storyCfg.custom_url[url].url);
            }
        } else {
            window.history.pushState({ "pageTitle": title }, "", '/');
        }
    }

};

var openNewAddress = function (data, isPopState = false, useCustom = false) {

    // File Path
    const filePath = data.path;

    // Prepare Custom URL
    if (useCustom && storyCfg.custom_url[data.path]) {
        isPopState = false;
    }

    if (!data || typeof filePath !== 'string' || filePath.length < 1 || !filePath.startsWith('/') || filePath.indexOf('http://') > -1 || filePath.indexOf('https://') > -1) {
        insertMarkdownFile(storyData.readme, true, true);
    } else {
        openMDFIle(filePath);
        if (typeof data.title === 'string' && data.title.length > 0) {
            urlUpdate(data.path, data.title, isPopState);
        } else {
            urlUpdate(data.path, null, isPopState);
        }
    }

};

// Pop State
$(window).on('popstate', function () {

    // Remove Fic Data
    clearFicData();

    // Get Params
    const urlSearchParams = new URLSearchParams(document.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    // Load Page
    const loadPage = function () {
        if (storyData.urlPage !== params.path) {
            storyData.urlPage = params.path;
            if (params.path !== 'read-fic') {
                openNewAddress(params, true);
            } else { openChapterMenu(params); }
        }
    };

    // Default
    if (document.location.pathname === '/') { loadPage(); }

    // Custom
    else {

        // Get Data
        const urlData = Object.entries(storyCfg.custom_url).find(item => item[1].url === document.location.pathname);
        if (urlData) {
            params.path = urlData[0];
            params.title = urlData[1].title;
            loadPage();
        }

    }

});

// Insert Maarkdown File
var insertMarkdownFile = function (text, isMainPage = false, isHTML = false) {

    // Prepare Convert Base
    const convertBase = `https\\:\\/\\/github.com\\/${storyCfg.github.account}\\/${storyCfg.github.repository}\\/blob\\/main\\/`;

    // Convert Data
    let data;

    if (!isHTML) {
        data = marked.parse(text);
    } else {
        data = text;
    }

    data = data.replace(new RegExp(`href\=\"${convertBase}docs\\/`, 'g'), 'href="javascript:void(0)" file="/')
        .replace(new RegExp(`src\=\"${convertBase}docs\\/`, 'g'), 'src="/');

    // Insert Data
    $('#markdown-read').empty().html(data);
    if (isMainPage) {
        $('#top_page').removeClass('d-none');
    } else {
        $('#top_page').addClass('d-none');
    }

    // Convert File URLs
    $('[id="markdown-read"] a[file]').removeAttr('target').click(function () {
        openMDFIle($(this).attr('file'));
        urlUpdate($(this).attr('file'), $(this).text().trim());
    });

    // Fix Image
    $('[id="markdown-read"] img').each(function () {
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
            }).on('load', function () {

                const newImg = new Image();
                const tinyThis = $(this);

                newImg.onload = function () {
                    tinyThis.data('image-size', { width: this.width, height: this.height });
                    tinyThis.css({ 'opacity': '100%', 'pointer-events': '' });
                }

                newImg.src = $(this).attr('src');

            }).click(function () {
                const imgSize = $(this).data('image-size');
                var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, [{ src: $(this).attr('src'), h: imgSize.height, w: imgSize.width }], { index: 0 });
                gallery.init();
                $(this).fadeTo("fast", 0.7, function () {
                    $(this).fadeTo("fast", 1);
                });
                return false;
            }).hover(function () {
                $(this).fadeTo("fast", 0.8);
            }, function () {
                $(this).fadeTo("fast", 1);
            });

            // Load Image
            newImage.attr('src', src);

            const newTinyPlace = $('<p>', { class: 'mt-4' });
            newTinyPlace.insertAfter(newImage);

        }
    });

};

// Remove Fic Data
var clearFicData = function () {

    for (const item in storyData.sfx) {

        if (typeof storyData.sfx[item].hide === 'function') {
            storyData.sfx[item].hide(0);
        }

        if (storyData.sfx[item].pizzicato && typeof storyData.sfx[item].pizzicato.hide === 'function') {
            storyData.sfx[item].pizzicato.hide(0);
        }

    }

    $('body')
        .removeClass('ficMode')
        .removeClass(`fic-daycicle-morning`)
        .removeClass(`fic-daycicle-evening`)
        .removeClass(`fic-daycicle-night`)
        .removeClass(`fic-daycicle-lateAtNight`);

    $('[id="fic-nav"] > #status').empty();
    $('#fic-chapter').empty();
    storyData.readFic = false;
    storyData.chapter.html = {};
    storyData.chapter.line = null;
    storyData.chapter.nav = {};
    storyData.chapter.selected = 0;

    if (storyData.youtube.player && storyData.youtube.checkYT() && storyData.youtube.state === YT.PlayerState.PLAYING) {
        storyData.youtube.player.stopVideo();
    }

};

// Open MD FIle
var openMDFIle = function (url, isMain = false) {

    // Remove Fic Data
    clearFicData();
    if (url !== 'MAIN') {

        // Read Data Base
        console.log(`Opening MD file "${url}"...`);
        $.LoadingOverlay("show", { background: "rgba(0,0,0, 0.5)" });

        $.ajax({
            url: url + fileVersion,
            type: 'get',
            dataType: 'text'
        }).done(function (fileData) {

            if (url.endsWith('.md')) {
                console.log(`MD File opened successfully!`);
                insertMarkdownFile(fileData, isMain, false);
            } else {
                console.log(`HTML File opened successfully!`);
                insertMarkdownFile(fileData, isMain, true);
            }

            tinyLib.goToByScrollTop(0);
            $.LoadingOverlay("hide");

        }).fail(err => {
            $.LoadingOverlay("hide");
            console.error(err);
            alert(err.message);
        });
    } else {
        insertMarkdownFile(storyData.readme, isMain, true);
    }

};

// Start App
$(function () {
    console.log('Starting App...');
    storyData.start(function (fn, readme) {

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

        // Get News
        /* if (storyCfg && storyCfg.news && storyCfg.news.url) {
            fetch(storyCfg.news.url, { method: 'GET' })
                .then(response => response.json())
                .then(data => {

                    console.log(data);

                });
        } */


        /* 
        
dsMK.toHTML(data[item].content, {
    escapeHTML: true,
    embed: false,
    discordOnly: false,
});
        
        */

        // Read Me Disable
        let readButtonDisabled = '';
        if (storyCfg.underDevelopment) {
            readButtonDisabled = ' d-none';
        }

        // Read Updater
        let isNewValue = '';
        storyData.globalIsNew = 0;
        for (const chapter in storyData.isNew) {
            if (storyData.isNew[chapter] === 2 && storyData.isNew[chapter] > storyData.globalIsNew) {
                storyData.globalIsNew = 2;
                isNewValue = $('<span>', { class: 'badge badge-primary ms-2' }).text('NEW');
            } else if (storyData.isNew[chapter] === 1 && storyData.isNew[chapter] > storyData.globalIsNew) {
                storyData.globalIsNew = 1;
                isNewValue = $('<span>', { class: 'badge badge-secondary ms-2' }).text('UPDATE');
            }
        }

        // Year
        const yearNow = moment().year();
        let copyrightText = null;
        if (yearNow === storyCfg.year) {
            copyrightText = `© ${storyCfg.year} ${storyCfg.title} | `;
        } else {
            copyrightText = `© ${storyCfg.year} - ${yearNow} ${storyCfg.title} | `;
        }

        const navbarItems = function () {
            return [

                // Title
                $('<a>', { class: 'navbar-brand d-none d-lg-block', href: '/' }).text(storyCfg.title).click(function () {
                    openMDFIle('MAIN', true);
                    urlUpdate();
                    return false;
                }),

                // Nav 1
                $('<ul>', { class: 'navbar-nav me-auto mt-2 mt-lg-0 small' }).append(

                    // Homepage
                    $('<li>', { class: 'nav-item' }).prepend(
                        $('<a>', { class: 'nav-link', href: '/', id: 'homepage' }).text('Homepage').prepend(
                            $('<i>', { class: 'fas fa-home me-2' })
                        )
                    ).click(function () {
                        openMDFIle('MAIN', true);
                        urlUpdate();
                        return false;
                    }),

                    // Discord Server
                    $('<li>', { class: 'nav-item' }).prepend(
                        $('<a>', { class: 'nav-link', target: '_blank', href: `https://discord.gg/${storyCfg.discordInvite}`, id: 'discord-server' }).text('Discord Server').prepend(
                            $('<i>', { class: 'fab fa-discord me-2' })
                        )
                    ),

                    // Derpibooru
                    $('<li>', { class: 'nav-item' }).prepend(
                        $('<a>', { target: '_blank', class: 'nav-link', href: 'https://derpibooru.org/tags/' + storyCfg.derpibooru_tag, id: 'derpibooru-page' }).text('Derpibooru').prepend(
                            $('<i>', { class: 'fa-solid fa-paintbrush me-2' })
                        )
                    ),

                    // Donations Button
                    $('<li>', { class: 'nav-item dropdown' }).prepend(

                        $('<a>', { class: 'nav-link dropdown-toggle', href: '#', role: 'button', 'data-bs-toggle': 'dropdown', 'aria-expanded': 'false' }).text('Donations').append(
                            $('<span>', { class: 'navbar-toggler-icon' })
                        ),

                        $('<ul>', { class: 'dropdown-menu' }).append(

                            // Patreon
                            $('<li>').prepend(
                                $('<a>', { class: 'dropdown-item', target: '_blank', href: `https://patreon.com/${storyCfg.patreon}`, id: 'patreon-url' }).text('Patreon').prepend(
                                    $('<i>', { class: 'fa-brands fa-patreon me-2' })
                                )
                            ),

                            // Kofi
                            $('<li>').prepend(
                                $('<a>', { class: 'dropdown-item', target: '_blank', href: `https://ko-fi.com/${storyCfg.kofi}`, id: 'kofi-url' }).text('Ko-Fi').prepend(
                                    $('<i>', { class: 'fa-solid fa-mug-hot me-2' })
                                )
                            ),

                            // Crypto Wallet
                            $('<li>').prepend(
                                $('<a>', { class: 'dropdown-item', target: '_blank', href: storyCfg.nftDomain.url.replace('{domain}', storyCfg.nftDomain.domainWallet), id: 'crypto-wallet' }).text('Crypto Donations').prepend(
                                    $('<i>', { class: 'fas fa-wallet me-2' })
                                )
                            ),

                        )

                    ),

                    // Blog
                    /* $('<li>', { class: 'nav-item nav-link', target: '_blank', href: storyCfg.blog_url, id: 'blog-url' }).text('Blog').prepend(
                        $('<i>', { class: 'fa-solid fa-rss me-2' })
                    ), */

                    // LICENSE
                    $('<li>', { class: 'nav-item ' }).prepend(
                        $('<a>', { class: 'nav-link', href: '/?path=%2FLICENSE.md&title=License' }).text('License').prepend(
                            $('<i>', { class: 'fas fa-copyright me-2', href: '/?path=%2FLICENSE.md&title=License', id: 'license' })
                        )
                    ).click(function () {
                        openMDFIle('/LICENSE.md');
                        urlUpdate('/LICENSE.md', 'License');
                        return false;
                    })

                ),

                // Nav 2
                $('<ul>', { class: 'nav navbar-nav ms-auto mb-2 mb-lg-0 small', id: 'fic-nav' }).append(

                    // Status Place
                    $('<li>', { id: 'status' }).css('display', 'contents'),

                    // Chapter Name
                    $('<li>', { id: 'fic-chapter', class: 'nav-item nav-link' }),

                    // Read Fanfic
                    $('<li>', { class: 'nav-item font-weight-bold' + readButtonDisabled }).prepend(
                        $('<a>', { id: 'fic-start', class: 'nav-link', href: '/?path=read-fic&title=Pony%20Driland' }).text('Read Fic').append(isNewValue).prepend(
                            $('<i>', { class: 'fab fa-readme me-2' })
                        )
                    ).click(function () {
                        if (!readButtonDisabled) {
                            $('#top_page').addClass('d-none');
                            openChapterMenu();
                            urlUpdate('read-fic');
                        }
                        return false;
                    })

                )

            ];
        };

        // Insert Navbar
        $('body').prepend(

            // Navbar
            $('<nav>', { class: 'navbar navbar-expand-lg navbar-dark bg-dark fixed-top', id: 'md-navbar' }).append(

                // Title
                $('<a>', { class: 'navbar-brand d-block d-lg-none ms-sm-4', href: '/' }).text(storyCfg.title).click(function () {
                    openMDFIle('MAIN', true);
                    urlUpdate();
                    return false;
                }),

                // Collapse
                $('<div>', { class: 'collapse navbar-collapse', id: 'mdMenu' }).append(navbarItems()),

                // OffCanvas
                $('<div>', { class: 'offcanvas offcanvas-end d-lg-none', tabindex: -1, id: 'offcanvasNavbar', 'aria-labelledby': 'offcanvasNavbarLabel' }).append(

                    $('<div>', { class: 'offcanvas-header' }).append(

                        $('<h5>', {class: 'offcanvas-title', id: 'offcanvasNavbarLabel'}).text(storyCfg.title),
                        $('<button>', { class: 'btn-close', type: 'button', 'data-bs-dismiss': 'offcanvas'}),

                        $('<div>', {class: 'offcanvas-body'}).append(navbarItems())

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
                                        $('<i>', { class: 'fab fa-ethereum me-2' })
                                    )
                                ),

                                $('<li>').append(
                                    $('<a>', { href: `https://${storyData.cid32}.ipfs.dweb.link/` }).text('IPFS ' + storyCfg.nftDomain.name).prepend(
                                        $('<i>', { class: 'fas fa-wifi me-2' })
                                    )
                                ),

                                $('<li>').append(
                                    $('<a>', { target: '_blank', href: `https://discord.gg/${storyCfg.discordInvite}` }).text('Discord Server').prepend(
                                        $('<i>', { class: 'fab fa-discord me-2' })
                                    ),
                                )

                            )
                        ),

                        // Links 2
                        $('<div>', { class: 'col-md-3 mb-md-0 mb-3' }).append(
                            $('<h5>').text('Links'),
                            $('<ul>', { class: 'list-unstyled' }).append(

                                $('<li>').append(
                                    $('<a>', { target: '_blank', href: storyCfg.nftDomain.url.replace('{domain}', storyCfg.nftDomain.valueURL) }).text(storyCfg.nftDomain.name).prepend(
                                        $('<i>', { class: 'fas fa-marker me-2' })
                                    ),
                                ),

                                $('<li>').append(
                                    $('<a>', { target: '_blank', href: `https://github.com/${storyCfg.github.account}/${storyCfg.github.repository}` }).text('Github').prepend(
                                        $('<i>', { class: 'fab fa-github me-2' })
                                    ),
                                ),

                                $('<li>').append(
                                    $('<a>', { target: '_blank', href: 'mailto:' + storyCfg.contact }).text('Contact').prepend(
                                        $('<i>', { class: 'fas fa-envelope me-2' })
                                    )
                                )

                            )
                        )

                    )
                ),

                // Copyright
                $('<div>', { id: 'footer2', class: 'footer-copyright text-center py-3 bg-secondary text-white' })
                    .text(copyrightText).append(
                        $('<a>', { target: '_blank', href: storyCfg.creator_url }).text(storyCfg.creator),
                        '.'
                    )

            )
        );

        // Start Readme
        if (params.path !== 'read-fic') {
            openNewAddress(params, true, true);
        } else { openChapterMenu(params); }

        // Complete
        if (storyCfg.underDevelopment) { $('#under-development').modal(); }
        fn();

    });
});